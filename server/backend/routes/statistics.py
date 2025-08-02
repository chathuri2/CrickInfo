from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import func, desc
from ..app import db
from ..models import (
    Player, PlayerStatistics, Squad, SquadPlayer, MatchConditions, 
    SmartSuggestion, SuggestionPlayer, PlayerRole, MatchFormat, PitchType, Weather
)
from ..schemas import MatchConditionsSchema, SmartSuggestionSchema, SquadAnalysisSchema

statistics_bp = Blueprint('statistics', __name__)
match_conditions_schema = MatchConditionsSchema()
smart_suggestion_schema = SmartSuggestionSchema()
squad_analysis_schema = SquadAnalysisSchema()

@statistics_bp.route('/match-conditions', methods=['POST'])
@jwt_required()
def create_match_conditions():
    """Create match conditions for analysis"""
    try:
        data = match_conditions_schema.load(request.get_json())
        
        new_conditions = MatchConditions(
            format=data['format'],
            pitch_type=data['pitch_type'],
            weather=data['weather'],
            venue=data['venue']
        )
        
        db.session.add(new_conditions)
        db.session.commit()
        
        return jsonify({
            'message': 'Match conditions created successfully',
            'conditions': match_conditions_schema.dump(new_conditions)
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create match conditions', 'message': str(e)}), 500

@statistics_bp.route('/smart-suggestion', methods=['POST'])
@jwt_required()
def generate_smart_suggestion():
    """Generate smart squad suggestions based on match conditions"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        squad_id = data.get('squad_id')
        match_conditions_id = data.get('match_conditions_id')
        
        if not squad_id or not match_conditions_id:
            return jsonify({'error': 'Squad ID and match conditions ID are required'}), 400
        
        # Get squad and match conditions
        squad = Squad.query.filter_by(id=squad_id, user_id=user_id).first()
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        match_conditions = MatchConditions.query.get(match_conditions_id)
        if not match_conditions:
            return jsonify({'error': 'Match conditions not found'}), 404
        
        # Get current squad players
        squad_players = SquadPlayer.query.filter_by(squad_id=squad_id).all()
        current_player_ids = [sp.player_id for sp in squad_players]
        
        # Get all available players
        all_players = Player.query.all()
        
        # Analyze match conditions and suggest players
        suggestions = analyze_match_conditions(
            match_conditions, all_players, current_player_ids
        )
        
        # Create smart suggestion record
        reasoning = generate_reasoning(match_conditions, suggestions)
        confidence = calculate_confidence(suggestions, match_conditions)
        
        smart_suggestion = SmartSuggestion(
            squad_id=squad_id,
            match_conditions_id=match_conditions_id,
            reasoning=reasoning,
            confidence=confidence
        )
        
        db.session.add(smart_suggestion)
        db.session.commit()
        
        # Add suggested players
        for i, player in enumerate(suggestions):
            suggestion_player = SuggestionPlayer(
                suggestion_id=smart_suggestion.id,
                player_id=player['id'],
                priority=len(suggestions) - i  # Higher priority for better suggestions
            )
            db.session.add(suggestion_player)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Smart suggestion generated successfully',
            'suggestion': {
                'id': smart_suggestion.id,
                'reasoning': reasoning,
                'confidence': confidence,
                'suggested_players': suggestions,
                'match_conditions': match_conditions_schema.dump(match_conditions)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to generate smart suggestion', 'message': str(e)}), 500

@statistics_bp.route('/squad-analysis', methods=['POST'])
@jwt_required()
def analyze_squad():
    """Analyze squad composition and performance"""
    try:
        user_id = get_jwt_identity()
        data = squad_analysis_schema.load(request.get_json())
        
        squad = Squad.query.filter_by(id=data['squad_id'], user_id=user_id).first()
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        
        match_conditions = MatchConditions.query.get(data['match_conditions_id'])
        if not match_conditions:
            return jsonify({'error': 'Match conditions not found'}), 404
        
        # Get squad players
        squad_players = SquadPlayer.query.filter_by(squad_id=data['squad_id']).all()
        players = []
        
        for squad_player in squad_players:
            player = Player.query.get(squad_player.player_id)
            if player:
                # Get player statistics for the match format
                stats = PlayerStatistics.query.filter_by(
                    player_id=player.id, format=match_conditions.format
                ).first()
                
                player_data = {
                    'id': player.id,
                    'name': player.name,
                    'role': player.role.value,
                    'country': player.country,
                    'statistics': None
                }
                
                if stats:
                    player_data['statistics'] = {
                        'batting_average': stats.batting_average,
                        'bowling_average': stats.bowling_average,
                        'strike_rate': stats.strike_rate,
                        'economy_rate': stats.economy_rate,
                        'recent_form': stats.recent_form
                    }
                
                players.append(player_data)
        
        # Analyze squad composition
        analysis = analyze_squad_composition(players, match_conditions)
        
        return jsonify({
            'analysis': analysis,
            'squad': {
                'id': squad.id,
                'name': squad.name,
                'players': players
            },
            'match_conditions': match_conditions_schema.dump(match_conditions)
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to analyze squad', 'message': str(e)}), 500

@statistics_bp.route('/top-players', methods=['GET'])
def get_top_players():
    """Get top players by statistics"""
    try:
        format = request.args.get('format', 'T20')
        role = request.args.get('role')
        limit = request.args.get('limit', 10, type=int)
        
        query = db.session.query(Player, PlayerStatistics).join(
            PlayerStatistics, Player.id == PlayerStatistics.player_id
        ).filter(PlayerStatistics.format == MatchFormat(format))
        
        if role:
            query = query.filter(Player.role == PlayerRole(role))
        
        # Order by batting average for batsmen, bowling average for bowlers
        if role == 'Batsman':
            query = query.order_by(desc(PlayerStatistics.batting_average))
        elif role == 'Bowler':
            query = query.order_by(desc(PlayerStatistics.bowling_average))
        else:
            # For all-rounders or general, use a combination
            query = query.order_by(desc(PlayerStatistics.batting_average))
        
        results = query.limit(limit).all()
        
        top_players = []
        for player, stats in results:
            player_data = {
                'id': player.id,
                'name': player.name,
                'role': player.role.value,
                'country': player.country,
                'statistics': {
                    'batting_average': stats.batting_average,
                    'bowling_average': stats.bowling_average,
                    'strike_rate': stats.strike_rate,
                    'economy_rate': stats.economy_rate,
                    'recent_form': stats.recent_form
                }
            }
            top_players.append(player_data)
        
        return jsonify({'top_players': top_players}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch top players', 'message': str(e)}), 500

@statistics_bp.route('/formats', methods=['GET'])
def get_match_formats():
    """Get all available match formats"""
    return jsonify({
        'formats': [format.value for format in MatchFormat]
    }), 200

@statistics_bp.route('/pitch-types', methods=['GET'])
def get_pitch_types():
    """Get all available pitch types"""
    return jsonify({
        'pitch_types': [pitch_type.value for pitch_type in PitchType]
    }), 200

@statistics_bp.route('/weather-conditions', methods=['GET'])
def get_weather_conditions():
    """Get all available weather conditions"""
    return jsonify({
        'weather_conditions': [weather.value for weather in Weather]
    }), 200

def analyze_match_conditions(match_conditions, all_players, current_player_ids):
    """Analyze match conditions and suggest players"""
    suggestions = []
    
    for player in all_players:
        if player.id in current_player_ids:
            continue  # Skip players already in squad
        
        # Get player statistics for the match format
        stats = PlayerStatistics.query.filter_by(
            player_id=player.id, format=match_conditions.format
        ).first()
        
        if not stats:
            continue
        
        score = calculate_player_score(player, stats, match_conditions)
        
        if score > 0:
            suggestions.append({
                'id': player.id,
                'name': player.name,
                'role': player.role.value,
                'country': player.country,
                'score': score,
                'statistics': {
                    'batting_average': stats.batting_average,
                    'bowling_average': stats.bowling_average,
                    'strike_rate': stats.strike_rate,
                    'economy_rate': stats.economy_rate,
                    'recent_form': stats.recent_form
                }
            })
    
    # Sort by score (highest first)
    suggestions.sort(key=lambda x: x['score'], reverse=True)
    
    return suggestions[:10]  # Return top 10 suggestions

def calculate_player_score(player, stats, match_conditions):
    """Calculate player suitability score based on match conditions"""
    score = 0
    
    # Base score from recent form
    if stats.recent_form:
        score += stats.recent_form * 0.3
    
    # Format-specific scoring
    if match_conditions.format == MatchFormat.T20:
        if stats.strike_rate:
            score += stats.strike_rate * 0.2
        if stats.economy_rate:
            score += (50 - stats.economy_rate) * 0.1  # Lower economy is better
    elif match_conditions.format == MatchFormat.TEST:
        if stats.batting_average:
            score += stats.batting_average * 0.4
        if stats.bowling_average:
            score += (50 - stats.bowling_average) * 0.3  # Lower average is better
    
    # Pitch type considerations
    if match_conditions.pitch_type == PitchType.BATTING:
        if player.role == PlayerRole.BATSMAN and stats.batting_average:
            score += stats.batting_average * 0.3
    elif match_conditions.pitch_type == PitchType.BOWLING:
        if player.role == PlayerRole.BOWLER and stats.bowling_average:
            score += (50 - stats.bowling_average) * 0.3
    elif match_conditions.pitch_type == PitchType.SPIN_FRIENDLY:
        if player.role == PlayerRole.BOWLER:
            score += 20  # Bonus for bowlers on spin-friendly pitches
    
    # Weather considerations
    if match_conditions.weather == Weather.RAINY:
        if player.role == PlayerRole.BOWLER:
            score += 15  # Bowlers get advantage in rainy conditions
    
    return max(0, score)

def generate_reasoning(match_conditions, suggestions):
    """Generate reasoning for suggestions"""
    reasoning = []
    
    reasoning.append(f"Analysis for {match_conditions.format.value} match at {match_conditions.venue}")
    reasoning.append(f"Pitch type: {match_conditions.pitch_type.value}")
    reasoning.append(f"Weather: {match_conditions.weather.value}")
    
    if suggestions:
        reasoning.append(f"Top {len(suggestions)} recommended players:")
        for i, player in enumerate(suggestions[:5], 1):
            reasoning.append(f"{i}. {player['name']} ({player['role']}) - Score: {player['score']:.1f}")
    
    return "\n".join(reasoning)

def calculate_confidence(suggestions, match_conditions):
    """Calculate confidence level of suggestions"""
    if not suggestions:
        return 0
    
    # Base confidence on number and quality of suggestions
    avg_score = sum(s['score'] for s in suggestions) / len(suggestions)
    confidence = min(95, avg_score / 10)  # Scale to 0-95%
    
    return round(confidence, 1)

def analyze_squad_composition(players, match_conditions):
    """Analyze squad composition and performance"""
    analysis = {
        'total_players': len(players),
        'role_distribution': {},
        'average_batting': 0,
        'average_bowling': 0,
        'strengths': [],
        'weaknesses': [],
        'recommendations': []
    }
    
    # Count roles
    roles = {}
    batting_scores = []
    bowling_scores = []
    
    for player in players:
        role = player['role']
        roles[role] = roles.get(role, 0) + 1
        
        if player['statistics']:
            if player['statistics']['batting_average']:
                batting_scores.append(player['statistics']['batting_average'])
            if player['statistics']['bowling_average']:
                bowling_scores.append(player['statistics']['bowling_average'])
    
    analysis['role_distribution'] = roles
    
    if batting_scores:
        analysis['average_batting'] = sum(batting_scores) / len(batting_scores)
    if bowling_scores:
        analysis['average_bowling'] = sum(bowling_scores) / len(bowling_scores)
    
    # Analyze strengths and weaknesses
    if analysis['average_batting'] > 35:
        analysis['strengths'].append('Strong batting lineup')
    if analysis['average_bowling'] < 30:
        analysis['strengths'].append('Strong bowling attack')
    
    if roles.get('Batsman', 0) < 3:
        analysis['weaknesses'].append('Limited batting options')
    if roles.get('Bowler', 0) < 3:
        analysis['weaknesses'].append('Limited bowling options')
    if roles.get('Wicket-keeper', 0) < 1:
        analysis['weaknesses'].append('No wicket keeper')
    
    # Format-specific recommendations
    if match_conditions.format == MatchFormat.T20:
        if analysis['average_batting'] < 25:
            analysis['recommendations'].append('Consider adding more aggressive batsmen for T20')
    elif match_conditions.format == MatchFormat.TEST:
        if analysis['average_batting'] < 30:
            analysis['recommendations'].append('Consider adding more defensive batsmen for Test cricket')
    
    return analysis 