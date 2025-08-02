from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc
from ..app import db
from ..models import User, UserRole, Player, Squad, PlayerStatistics
from ..schemas import UserSchema

admin_bp = Blueprint('admin', __name__)
user_schema = UserSchema()

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users = User.query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users_data = []
        for user in users.items:
            user_dict = user_schema.dump(user)
            users_data.append(user_dict)
        
        return jsonify({
            'users': users_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users', 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    """Update user role (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in [role.value for role in UserRole]:
            return jsonify({'error': 'Invalid role'}), 400
        
        user.role = UserRole(new_role)
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': user_schema.dump(user)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user role', 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete user', 'message': str(e)}), 500

@admin_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_system_statistics():
    """Get system statistics (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Count total users
        total_users = User.query.count()
        admin_users = User.query.filter_by(role=UserRole.ADMIN).count()
        regular_users = total_users - admin_users
        
        # Count total players
        total_players = Player.query.count()
        
        # Count players by role
        players_by_role = db.session.query(
            Player.role, func.count(Player.id)
        ).group_by(Player.role).all()
        
        role_distribution = {}
        for role, count in players_by_role:
            role_distribution[role.value] = count
        
        # Count total squads
        total_squads = Squad.query.count()
        
        # Count squads by user
        squads_by_user = db.session.query(
            Squad.user_id, func.count(Squad.id)
        ).group_by(Squad.user_id).all()
        
        # Count total statistics records
        total_statistics = PlayerStatistics.query.count()
        
        # Get recent activity (last 7 days)
        from datetime import datetime, timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        recent_users = User.query.filter(
            User.created_at >= week_ago
        ).count()
        
        recent_squads = Squad.query.filter(
            Squad.created_at >= week_ago
        ).count()
        
        statistics = {
            'users': {
                'total': total_users,
                'admins': admin_users,
                'regular': regular_users,
                'recent_registrations': recent_users
            },
            'players': {
                'total': total_players,
                'by_role': role_distribution
            },
            'squads': {
                'total': total_squads,
                'recent_created': recent_squads
            },
            'statistics': {
                'total_records': total_statistics
            }
        }
        
        return jsonify({'statistics': statistics}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch statistics', 'message': str(e)}), 500

@admin_bp.route('/players/bulk-import', methods=['POST'])
@jwt_required()
def bulk_import_players():
    """Bulk import players from CSV (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        players_data = data.get('players', [])
        
        if not players_data:
            return jsonify({'error': 'No players data provided'}), 400
        
        imported_count = 0
        errors = []
        
        for player_data in players_data:
            try:
                # Validate required fields
                required_fields = ['name', 'role', 'country']
                for field in required_fields:
                    if field not in player_data:
                        errors.append(f"Player {player_data.get('name', 'Unknown')}: Missing {field}")
                        continue
                
                # Check if player already exists
                existing_player = Player.query.filter_by(name=player_data['name']).first()
                if existing_player:
                    errors.append(f"Player {player_data['name']}: Already exists")
                    continue
                
                # Create new player
                new_player = Player(
                    name=player_data['name'],
                    role=PlayerRole(player_data['role']),
                    country=player_data['country'],
                    matches_played=player_data.get('matches_played', 0)
                )
                
                db.session.add(new_player)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Player {player_data.get('name', 'Unknown')}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {imported_count} players',
            'imported_count': imported_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to import players', 'message': str(e)}), 500

@admin_bp.route('/players/bulk-statistics', methods=['POST'])
@jwt_required()
def bulk_import_statistics():
    """Bulk import player statistics (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        statistics_data = data.get('statistics', [])
        
        if not statistics_data:
            return jsonify({'error': 'No statistics data provided'}), 400
        
        imported_count = 0
        updated_count = 0
        errors = []
        
        for stat_data in statistics_data:
            try:
                # Validate required fields
                required_fields = ['player_id', 'format']
                for field in required_fields:
                    if field not in stat_data:
                        errors.append(f"Statistics for player {stat_data.get('player_id', 'Unknown')}: Missing {field}")
                        continue
                
                # Check if player exists
                player = Player.query.get(stat_data['player_id'])
                if not player:
                    errors.append(f"Player ID {stat_data['player_id']}: Player not found")
                    continue
                
                # Check if statistics already exist
                existing_stats = PlayerStatistics.query.filter_by(
                    player_id=stat_data['player_id'],
                    format=MatchFormat(stat_data['format'])
                ).first()
                
                if existing_stats:
                    # Update existing statistics
                    for key, value in stat_data.items():
                        if key not in ['player_id', 'format'] and hasattr(existing_stats, key):
                            setattr(existing_stats, key, value)
                    updated_count += 1
                else:
                    # Create new statistics
                    new_stats = PlayerStatistics(
                        player_id=stat_data['player_id'],
                        format=MatchFormat(stat_data['format']),
                        batting_average=stat_data.get('batting_average'),
                        bowling_average=stat_data.get('bowling_average'),
                        strike_rate=stat_data.get('strike_rate'),
                        economy_rate=stat_data.get('economy_rate'),
                        recent_form=stat_data.get('recent_form')
                    )
                    db.session.add(new_stats)
                    imported_count += 1
                
            except Exception as e:
                errors.append(f"Statistics for player {stat_data.get('player_id', 'Unknown')}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {imported_count} new statistics and updated {updated_count} existing',
            'imported_count': imported_count,
            'updated_count': updated_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to import statistics', 'message': str(e)}), 500

@admin_bp.route('/system/health', methods=['GET'])
@jwt_required()
def system_health():
    """Get system health status (admin only)"""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Check database connectivity
        try:
            db.session.execute('SELECT 1')
            db_status = 'healthy'
        except Exception as e:
            db_status = f'unhealthy: {str(e)}'
        
        # Check table counts
        try:
            user_count = User.query.count()
            player_count = Player.query.count()
            squad_count = Squad.query.count()
            stats_count = PlayerStatistics.query.count()
        except Exception as e:
            user_count = player_count = squad_count = stats_count = 0
        
        health_status = {
            'database': db_status,
            'tables': {
                'users': user_count,
                'players': player_count,
                'squads': squad_count,
                'statistics': stats_count
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify({'health': health_status}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to check system health', 'message': str(e)}), 500 