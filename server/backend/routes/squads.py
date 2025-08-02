from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import and_
from ..app import db
from ..models import Squad, SquadPlayer, Player, PlayerRole, User
from ..schemas import SquadSchema, SquadWithPlayersSchema, SquadPlayerSchema

squads_bp = Blueprint('squads', __name__)
squad_schema = SquadSchema()
squad_with_players_schema = SquadWithPlayersSchema()
squad_player_schema = SquadPlayerSchema()

@squads_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_squads():
    """Get all squads for the current user"""
    try:
        user_id = get_jwt_identity()
        
        squads = Squad.query.filter_by(user_id=user_id).all()
        squads_data = []
        
        for squad in squads:
            squad_dict = squad_schema.dump(squad)
            
            # Get squad players
            squad_players = SquadPlayer.query.filter_by(squad_id=squad.id).all()
            players = []
            captain = None
            wicket_keeper = None
            
            for squad_player in squad_players:
                player = Player.query.get(squad_player.player_id)
                if player:
                    player_dict = {
                        'id': player.id,
                        'name': player.name,
                        'role': player.role.value,
                        'country': player.country,
                        'matches_played': player.matches_played
                    }
                    players.append(player_dict)
                    
                    # Check if this player is captain or wicket keeper
                    if squad.captain_id == player.id:
                        captain = player_dict
                    if squad.wicket_keeper_id == player.id:
                        wicket_keeper = player_dict
            
            squad_dict['players'] = players
            squad_dict['captain'] = captain
            squad_dict['wicket_keeper'] = wicket_keeper
            
            squads_data.append(squad_dict)
        
        return jsonify({'squads': squads_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch squads', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>', methods=['GET'])
@jwt_required()
def get_squad(squad_id):
    """Get a specific squad with players"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        squad_dict = squad_schema.dump(squad)
        
        # Get squad players
        squad_players = SquadPlayer.query.filter_by(squad_id=squad.id).all()
        players = []
        captain = None
        wicket_keeper = None
        
        for squad_player in squad_players:
            player = Player.query.get(squad_player.player_id)
            if player:
                player_dict = {
                    'id': player.id,
                    'name': player.name,
                    'role': player.role.value,
                    'country': player.country,
                    'matches_played': player.matches_played
                }
                players.append(player_dict)
                
                # Check if this player is captain or wicket keeper
                if squad.captain_id == player.id:
                    captain = player_dict
                if squad.wicket_keeper_id == player.id:
                    wicket_keeper = player_dict
        
        squad_dict['players'] = players
        squad_dict['captain'] = captain
        squad_dict['wicket_keeper'] = wicket_keeper
        
        return jsonify({'squad': squad_dict}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch squad', 'message': str(e)}), 500

@squads_bp.route('/', methods=['POST'])
@jwt_required()
def create_squad():
    """Create a new squad"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Squad name is required'}), 400
        
        # Check if squad name already exists for this user
        existing_squad = Squad.query.filter_by(
            user_id=user_id, name=data['name']
        ).first()
        
        if existing_squad:
            return jsonify({'error': 'Squad name already exists'}), 400
        
        new_squad = Squad(
            name=data['name'],
            user_id=user_id,
            captain_id=data.get('captain_id'),
            wicket_keeper_id=data.get('wicket_keeper_id')
        )
        
        db.session.add(new_squad)
        db.session.commit()
        
        return jsonify({
            'message': 'Squad created successfully',
            'squad': squad_schema.dump(new_squad)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create squad', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>', methods=['PUT'])
@jwt_required()
def update_squad(squad_id):
    """Update a squad"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            # Check if new name already exists for this user
            existing_squad = Squad.query.filter_by(
                user_id=user_id, name=data['name']
            ).first()
            if existing_squad and existing_squad.id != squad_id:
                return jsonify({'error': 'Squad name already exists'}), 400
            squad.name = data['name']
        
        if 'captain_id' in data:
            squad.captain_id = data['captain_id']
        if 'wicket_keeper_id' in data:
            squad.wicket_keeper_id = data['wicket_keeper_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Squad updated successfully',
            'squad': squad_schema.dump(squad)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update squad', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>', methods=['DELETE'])
@jwt_required()
def delete_squad(squad_id):
    """Delete a squad"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        db.session.delete(squad)
        db.session.commit()
        
        return jsonify({'message': 'Squad deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete squad', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>/players', methods=['POST'])
@jwt_required()
def add_player_to_squad(squad_id):
    """Add a player to a squad"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        data = request.get_json()
        player_id = data.get('player_id')
        
        if not player_id:
            return jsonify({'error': 'Player ID is required'}), 400
        
        # Check if player exists
        player = Player.query.get(player_id)
        if not player:
            return jsonify({'error': 'Player not found'}), 404
        
        # Check if player is already in squad
        existing_squad_player = SquadPlayer.query.filter_by(
            squad_id=squad_id, player_id=player_id
        ).first()
        
        if existing_squad_player:
            return jsonify({'error': 'Player is already in squad'}), 400
        
        # Add player to squad
        squad_player = SquadPlayer(squad_id=squad_id, player_id=player_id)
        db.session.add(squad_player)
        db.session.commit()
        
        return jsonify({
            'message': 'Player added to squad successfully',
            'player': {
                'id': player.id,
                'name': player.name,
                'role': player.role.value,
                'country': player.country
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add player to squad', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>/players/<int:player_id>', methods=['DELETE'])
@jwt_required()
def remove_player_from_squad(squad_id, player_id):
    """Remove a player from a squad"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        # Check if player is in squad
        squad_player = SquadPlayer.query.filter_by(
            squad_id=squad_id, player_id=player_id
        ).first()
        
        if not squad_player:
            return jsonify({'error': 'Player is not in squad'}), 404
        
        # Remove player from squad
        db.session.delete(squad_player)
        
        # If this player was captain or wicket keeper, clear those roles
        if squad.captain_id == player_id:
            squad.captain_id = None
        if squad.wicket_keeper_id == player_id:
            squad.wicket_keeper_id = None
        
        db.session.commit()
        
        return jsonify({'message': 'Player removed from squad successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to remove player from squad', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>/captain', methods=['PUT'])
@jwt_required()
def set_captain(squad_id):
    """Set squad captain"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        data = request.get_json()
        captain_id = data.get('captain_id')
        
        if captain_id:
            # Check if player exists and is in squad
            squad_player = SquadPlayer.query.filter_by(
                squad_id=squad_id, player_id=captain_id
            ).first()
            
            if not squad_player:
                return jsonify({'error': 'Captain must be a player in the squad'}), 400
        
        squad.captain_id = captain_id
        db.session.commit()
        
        return jsonify({'message': 'Captain updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update captain', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>/wicket-keeper', methods=['PUT'])
@jwt_required()
def set_wicket_keeper(squad_id):
    """Set squad wicket keeper"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        data = request.get_json()
        wicket_keeper_id = data.get('wicket_keeper_id')
        
        if wicket_keeper_id:
            # Check if player exists and is in squad
            squad_player = SquadPlayer.query.filter_by(
                squad_id=squad_id, player_id=wicket_keeper_id
            ).first()
            
            if not squad_player:
                return jsonify({'error': 'Wicket keeper must be a player in the squad'}), 400
            
            # Check if player is a wicket keeper
            player = Player.query.get(wicket_keeper_id)
            if player.role != PlayerRole.WICKET_KEEPER:
                return jsonify({'error': 'Selected player is not a wicket keeper'}), 400
        
        squad.wicket_keeper_id = wicket_keeper_id
        db.session.commit()
        
        return jsonify({'message': 'Wicket keeper updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update wicket keeper', 'message': str(e)}), 500

@squads_bp.route('/<int:squad_id>/validate', methods=['GET'])
@jwt_required()
def validate_squad(squad_id):
    """Validate squad composition"""
    try:
        user_id = get_jwt_identity()
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        # Get squad players
        squad_players = SquadPlayer.query.filter_by(squad_id=squad_id).all()
        players = []
        
        for squad_player in squad_players:
            player = Player.query.get(squad_player.player_id)
            if player:
                players.append(player)
        
        # Validate squad composition
        validation = {
            'total_players': len(players),
            'batsmen': len([p for p in players if p.role == PlayerRole.BATSMAN]),
            'bowlers': len([p for p in players if p.role == PlayerRole.BOWLER]),
            'all_rounders': len([p for p in players if p.role == PlayerRole.ALL_ROUNDER]),
            'wicket_keepers': len([p for p in players if p.role == PlayerRole.WICKET_KEEPER]),
            'has_captain': squad.captain_id is not None,
            'has_wicket_keeper': squad.wicket_keeper_id is not None,
            'is_valid': True,
            'issues': []
        }
        
        # Check for issues
        if validation['total_players'] < 11:
            validation['is_valid'] = False
            validation['issues'].append('Squad must have at least 11 players')
        
        if validation['total_players'] > 15:
            validation['is_valid'] = False
            validation['issues'].append('Squad cannot have more than 15 players')
        
        if validation['batsmen'] < 3:
            validation['issues'].append('Recommended to have at least 3 batsmen')
        
        if validation['bowlers'] < 3:
            validation['issues'].append('Recommended to have at least 3 bowlers')
        
        if validation['wicket_keepers'] < 1:
            validation['issues'].append('Recommended to have at least 1 wicket keeper')
        
        if not validation['has_captain']:
            validation['issues'].append('No captain selected')
        
        if not validation['has_wicket_keeper']:
            validation['issues'].append('No wicket keeper selected')
        
        return jsonify({'validation': validation}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to validate squad', 'message': str(e)}), 500 