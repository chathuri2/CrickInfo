from marshmallow import Schema, fields, validate, ValidationError
from .models import PlayerRole, MatchFormat, PitchType, Weather, UserRole

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)
    role = fields.Enum(UserRole, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class UserLoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

class PlayerSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    role = fields.Enum(PlayerRole, required=True)
    country = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    matches_played = fields.Int(validate=validate.Range(min=0))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class PlayerStatisticsSchema(Schema):
    id = fields.Int(dump_only=True)
    player_id = fields.Int(required=True)
    format = fields.Enum(MatchFormat, required=True)
    batting_average = fields.Float(validate=validate.Range(min=0))
    bowling_average = fields.Float(validate=validate.Range(min=0))
    strike_rate = fields.Float(validate=validate.Range(min=0))
    economy_rate = fields.Float(validate=validate.Range(min=0))
    recent_form = fields.Float(validate=validate.Range(min=0))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class PlayerWithStatsSchema(PlayerSchema):
    statistics = fields.Nested(PlayerStatisticsSchema, many=True, dump_only=True)

class SquadSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    user_id = fields.Int(dump_only=True)
    captain_id = fields.Int()
    wicket_keeper_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class SquadPlayerSchema(Schema):
    squad_id = fields.Int(required=True)
    player_id = fields.Int(required=True)

class SquadWithPlayersSchema(SquadSchema):
    players = fields.Nested(PlayerSchema, many=True, dump_only=True)
    captain = fields.Nested(PlayerSchema, dump_only=True)
    wicket_keeper = fields.Nested(PlayerSchema, dump_only=True)

class MatchConditionsSchema(Schema):
    id = fields.Int(dump_only=True)
    format = fields.Enum(MatchFormat, required=True)
    pitch_type = fields.Enum(PitchType, required=True)
    weather = fields.Enum(Weather, required=True)
    venue = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    created_at = fields.DateTime(dump_only=True)

class SmartSuggestionSchema(Schema):
    id = fields.Int(dump_only=True)
    squad_id = fields.Int(required=True)
    match_conditions_id = fields.Int(required=True)
    reasoning = fields.Str(required=True)
    confidence = fields.Float(required=True, validate=validate.Range(min=0, max=100))
    created_at = fields.DateTime(dump_only=True)

class SuggestionPlayerSchema(Schema):
    suggestion_id = fields.Int(required=True)
    player_id = fields.Int(required=True)
    priority = fields.Int(validate=validate.Range(min=0))

class SmartSuggestionWithPlayersSchema(SmartSuggestionSchema):
    suggested_players = fields.Nested(PlayerSchema, many=True, dump_only=True)
    match_conditions = fields.Nested(MatchConditionsSchema, dump_only=True)

class PlayerComparisonSchema(Schema):
    player1_id = fields.Int(required=True)
    player2_id = fields.Int(required=True)
    format = fields.Enum(MatchFormat, required=True)

class SquadAnalysisSchema(Schema):
    squad_id = fields.Int(required=True)
    match_conditions_id = fields.Int(required=True)

# Response schemas
class SuccessResponseSchema(Schema):
    message = fields.Str(required=True)
    data = fields.Dict()

class ErrorResponseSchema(Schema):
    error = fields.Str(required=True)
    message = fields.Str()

class PaginationSchema(Schema):
    page = fields.Int(validate=validate.Range(min=1))
    per_page = fields.Int(validate=validate.Range(min=1, max=100))
    total = fields.Int(dump_only=True)
    pages = fields.Int(dump_only=True)
    has_next = fields.Bool(dump_only=True)
    has_prev = fields.Bool(dump_only=True) 