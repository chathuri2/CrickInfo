from .app import db
from datetime import datetime
from enum import Enum

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"

class PlayerRole(Enum):
    BATSMAN = "Batsman"
    BOWLER = "Bowler"
    ALL_ROUNDER = "All-rounder"
    WICKET_KEEPER = "Wicket-keeper"

class MatchFormat(Enum):
    T20 = "T20"
    ODI = "ODI"
    TEST = "Test"

class PitchType(Enum):
    BATTING = "Batting"
    BOWLING = "Bowling"
    BALANCED = "Balanced"
    SPIN_FRIENDLY = "Spin-friendly"
    PACE_FRIENDLY = "Pace-friendly"

class Weather(Enum):
    SUNNY = "Sunny"
    OVERCAST = "Overcast"
    RAINY = "Rainy"
    HUMID = "Humid"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.USER)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    squads = db.relationship('Squad', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Player(db.Model):
    __tablename__ = 'players'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(PlayerRole), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    matches_played = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    statistics = db.relationship('PlayerStatistics', backref='player', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Player {self.name}>'

class PlayerStatistics(db.Model):
    __tablename__ = 'player_statistics'
    
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    format = db.Column(db.Enum(MatchFormat), nullable=False)
    batting_average = db.Column(db.Float)
    bowling_average = db.Column(db.Float)
    strike_rate = db.Column(db.Float)
    economy_rate = db.Column(db.Float)
    recent_form = db.Column(db.Float)  # Last 5 matches average
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('player_id', 'format', name='_player_format_uc'),)

class Squad(db.Model):
    __tablename__ = 'squads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    captain_id = db.Column(db.Integer, db.ForeignKey('players.id'))
    wicket_keeper_id = db.Column(db.Integer, db.ForeignKey('players.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    squad_players = db.relationship('SquadPlayer', backref='squad', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Squad {self.name}>'

class SquadPlayer(db.Model):
    __tablename__ = 'squad_players'
    
    id = db.Column(db.Integer, primary_key=True)
    squad_id = db.Column(db.Integer, db.ForeignKey('squads.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('squad_id', 'player_id', name='_squad_player_uc'),)

class MatchConditions(db.Model):
    __tablename__ = 'match_conditions'
    
    id = db.Column(db.Integer, primary_key=True)
    format = db.Column(db.Enum(MatchFormat), nullable=False)
    pitch_type = db.Column(db.Enum(PitchType), nullable=False)
    weather = db.Column(db.Enum(Weather), nullable=False)
    venue = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<MatchConditions {self.venue} - {self.format.value}>'

class SmartSuggestion(db.Model):
    __tablename__ = 'smart_suggestions'
    
    id = db.Column(db.Integer, primary_key=True)
    squad_id = db.Column(db.Integer, db.ForeignKey('squads.id'), nullable=False)
    match_conditions_id = db.Column(db.Integer, db.ForeignKey('match_conditions.id'), nullable=False)
    reasoning = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    suggested_players = db.relationship('SuggestionPlayer', backref='suggestion', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<SmartSuggestion {self.confidence}%>'

class SuggestionPlayer(db.Model):
    __tablename__ = 'suggestion_players'
    
    id = db.Column(db.Integer, primary_key=True)
    suggestion_id = db.Column(db.Integer, db.ForeignKey('smart_suggestions.id'), nullable=False)
    player_id = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    priority = db.Column(db.Integer, default=0)  # Higher number = higher priority
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('suggestion_id', 'player_id', name='_suggestion_player_uc'),) 