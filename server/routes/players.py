from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import or_
from ..app import db
from ..models import Player, PlayerStatistics, PlayerRole, MatchFormat, User, UserRole
from ..schemas import PlayerSchema, PlayerStatisticsSchema, PlayerWithStatsSchema, PlayerComparisonSchema

players_bp = Blueprint('players', __name__)
player_schema = PlayerSchema()
player_stats_schema = PlayerStatisticsSchema()
player_with_stats_schema = PlayerWithStatsSchema()
player_comparison_schema = PlayerComparisonSchema()

@players_bp.route('/', methods=['GET'])
def get_players():
    """Get all players with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        country = request.args.get('country')
        search = request.args.get('search')
        format = request.args.get('format')
        
        query = Player.query
        
        # Apply filters
        if role:
            query = query.filter(Player.role == PlayerRole(role))
        if country:
            query = query.filter(Player.country.ilike(f'%{country}%'))
        if search:
            query = query.filter(
                or_(
                    Player.name.ilike(f'%{search}%'),
                    Player.country.ilike(f'%{search}%')
                )
            )
        
        # Pagination
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        players_data = []
        for player in pagination.items:
            player_dict = player_schema.dump(player)
            
            # Add statistics if format is specified
            if format:
                stats = PlayerStatistics.query.filter_by(
                    player_id=player.id, format=MatchFormat(format)
                ).first()
                if stats:
                    player_dict['statistics'] = player_stats_schema.dump(stats)
            
            players_data.append(player_dict)
        
        return jsonify({
            'players': players_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch players', 'message': str(e)}), 500

@players_bp.route('/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a specific player with statistics"""
    try:
        player = Player.query.get(player_id)
        
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        player_data = player_with_stats_schema.dump(player)
        
        return jsonify({'player': player_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch player', 'message': str(e)}), 500

@players_bp.route('/', methods=['POST'])
@jwt_required()
def create_player():
    """Create a new player (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = player_schema.load(request.get_json())
        
        new_player = Player(
            name=data['name'],
            role=data['role'],
            country=data['country'],
            matches_played=data.get('matches_played', 0)
        )
        
        db.session.add(new_player)
        db.session.commit()
        
        return jsonify({
            'message': 'Player created successfully',
            'player': player_schema.dump(new_player)
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create player', 'message': str(e)}), 500

@players_bp.route('/<int:player_id>', methods=['PUT'])
@jwt_required()
def update_player(player_id):
    """Update a player (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        player = Player.query.get(player_id)
        
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            player.name = data['name']
        if 'role' in data:
            player.role = PlayerRole(data['role'])
        if 'country' in data:
            player.country = data['country']
        if 'matches_played' in data:
            player.matches_played = data['matches_played']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Player updated successfully',
            'player': player_schema.dump(player)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update player', 'message': str(e)}), 500

@players_bp.route('/<int:player_id>', methods=['DELETE'])
@jwt_required()
def delete_player(player_id):
    """Delete a player (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        player = Player.query.get(player_id)
        
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        db.session.delete(player)
        db.session.commit()
        
        return jsonify({'message': 'Player deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete player', 'message': str(e)}), 500

@players_bp.route('/<int:player_id>/statistics', methods=['POST'])
@jwt_required()
def add_player_statistics(player_id):
    """Add or update player statistics (admin only)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        player = Player.query.get(player_id)
        
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        data = player_stats_schema.load(request.get_json())
        data['player_id'] = player_id
        
        # Check if statistics already exist for this player and format
        existing_stats = PlayerStatistics.query.filter_by(
            player_id=player_id, format=data['format']
        ).first()
        
        if existing_stats:
            # Update existing statistics
            for key, value in data.items():
                if key != 'player_id':
                    setattr(existing_stats, key, value)
            db.session.commit()
            stats = existing_stats
        else:
            # Create new statistics
            stats = PlayerStatistics(**data)
            db.session.add(stats)
            db.session.commit()
        
        return jsonify({
            'message': 'Player statistics updated successfully',
            'statistics': player_stats_schema.dump(stats)
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update statistics', 'message': str(e)}), 500

@players_bp.route('/compare', methods=['POST'])
def compare_players():
    """Compare two players"""
    try:
        data = player_comparison_schema.load(request.get_json())
        
        player1 = Player.query.get(data['player1_id'])
        player2 = Player.query.get(data['player2_id'])
        
        if not player1 or not player2:
            return jsonify({'error': 'One or both players not found'}), 404
        
        # Get statistics for both players
        stats1 = PlayerStatistics.query.filter_by(
            player_id=data['player1_id'], format=data['format']
        ).first()
        
        stats2 = PlayerStatistics.query.filter_by(
            player_id=data['player2_id'], format=data['format']
        ).first()
        
        comparison = {
            'player1': {
                'player': player_schema.dump(player1),
                'statistics': player_stats_schema.dump(stats1) if stats1 else None
            },
            'player2': {
                'player': player_schema.dump(player2),
                'statistics': player_stats_schema.dump(stats2) if stats2 else None
            },
            'format': data['format'].value
        }
        
        return jsonify({'comparison': comparison}), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to compare players', 'message': str(e)}), 500

@players_bp.route('/roles', methods=['GET'])
def get_player_roles():
    """Get all available player roles"""
    return jsonify({
        'roles': [role.value for role in PlayerRole]
    }), 200

@players_bp.route('/countries', methods=['GET'])
def get_countries():
    """Get all countries with players"""
    try:
        countries = db.session.query(Player.country).distinct().all()
        return jsonify({
            'countries': [country[0] for country in countries]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch countries', 'message': str(e)}), 500 