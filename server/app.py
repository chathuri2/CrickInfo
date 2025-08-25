from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
import pandas as pd
import joblib
import jwt
import datetime

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
migrate = Migrate()

# Get the absolute path to the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Construct full paths to the model and encoders
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
ROLE_ENCODER_PATH = os.path.join(BASE_DIR, "ml", "role_encoder.pkl")
TYPE_ENCODER_PATH = os.path.join(BASE_DIR, "ml", "type_encoder.pkl")

try:
    model = joblib.load(MODEL_PATH)
    role_encoder = joblib.load(ROLE_ENCODER_PATH)
    type_encoder = joblib.load(TYPE_ENCODER_PATH)
    print("✅ Model and encoders loaded successfully.")
except Exception as e:
    print("❌ Failed to load model or encoders:", e)

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'supersecretkey')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///crickinfo.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-supersecretkey')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.players import players_bp
    from .routes.squads import squads_bp
    from .routes.statistics import statistics_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(players_bp, url_prefix='/api/players')
    app.register_blueprint(squads_bp, url_prefix='/api/squads')
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Health check
    @app.route("/")
    def index():
        return {"message": "CrickInfo API is running."}

    # Prediction Endpoint
    @app.route("/api/predict", methods=["POST"])
    def predict():
        try:
            data = request.get_json()
            role = data.get("role")
            player_type = data.get("type")
            features = data.get("features")  # List of numerical features

            if not (role and player_type and isinstance(features, list)):
                return jsonify({"error": "Missing or invalid input"}), 400

            # Encode role and type
            encoded_role = role_encoder.transform([role])[0]
            encoded_type = type_encoder.transform([player_type])[0]

            # Combine into final input
            model_input = [encoded_role, encoded_type] + features
            prediction = model.predict([model_input])

            return jsonify({"prediction": int(prediction[0])})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)

