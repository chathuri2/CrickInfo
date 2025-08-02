#!/usr/bin/env python3
"""
CrickInfo Backend API Runner
This script starts the Flask application with proper configuration.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import User, Player, PlayerRole, UserRole

def create_admin_user():
    """Create a default admin user if it doesn't exist"""
    app = create_app()
    with app.app_context():
        # Check if admin user exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            from app import bcrypt
            password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin_user = User(
                username='admin',
                email='admin@crickinfo.com',
                password_hash=password_hash,
                role=UserRole.ADMIN
            )
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Admin user created successfully!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Please change the password after first login!")
        else:
            print("ℹ️  Admin user already exists")

def seed_sample_data():
    """Seed the database with sample cricket players"""
    app = create_app()
    with app.app_context():
        # Check if players already exist
        if Player.query.count() > 0:
            print("ℹ️  Sample data already exists")
            return
        
        # Sample players data
        sample_players = [
            {
                'name': 'Virat Kohli',
                'role': PlayerRole.BATSMAN,
                'country': 'India',
                'matches_played': 254
            },
            {
                'name': 'Rohit Sharma',
                'role': PlayerRole.BATSMAN,
                'country': 'India',
                'matches_played': 233
            },
            {
                'name': 'Jasprit Bumrah',
                'role': PlayerRole.BOWLER,
                'country': 'India',
                'matches_played': 89
            },
            {
                'name': 'MS Dhoni',
                'role': PlayerRole.WICKET_KEEPER,
                'country': 'India',
                'matches_played': 350
            },
            {
                'name': 'Ravindra Jadeja',
                'role': PlayerRole.ALL_ROUNDER,
                'country': 'India',
                'matches_played': 175
            },
            {
                'name': 'Steve Smith',
                'role': PlayerRole.BATSMAN,
                'country': 'Australia',
                'matches_played': 95
            },
            {
                'name': 'Pat Cummins',
                'role': PlayerRole.BOWLER,
                'country': 'Australia',
                'matches_played': 88
            },
            {
                'name': 'Kane Williamson',
                'role': PlayerRole.BATSMAN,
                'country': 'New Zealand',
                'matches_played': 156
            },
            {
                'name': 'Trent Boult',
                'role': PlayerRole.BOWLER,
                'country': 'New Zealand',
                'matches_played': 78
            },
            {
                'name': 'Jos Buttler',
                'role': PlayerRole.WICKET_KEEPER,
                'country': 'England',
                'matches_played': 148
            }
        ]
        
        # Add players to database
        for player_data in sample_players:
            player = Player(**player_data)
            db.session.add(player)
        
        db.session.commit()
        print(f"✅ {len(sample_players)} sample players added successfully!")

def main():
    """Main function to run the application"""
    # Get environment
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Create Flask app
    app = create_app()
    
    # Initialize database
    with app.app_context():
        db.create_all()
        print("✅ Database initialized successfully!")
        
        # Create admin user
        create_admin_user()
        
        # Seed sample data
        seed_sample_data()
    
    # Run the application
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = env == 'development'
    
    print(f"🚀 Starting CrickInfo Backend API...")
    print(f"   Environment: {env}")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print(f"   API URL: http://{host}:{port}")
    print(f"   Health Check: http://{host}:{port}/api/health")
    
    app.run(
        host=host,
        port=port,
        debug=debug,
        use_reloader=debug
    )

if __name__ == '__main__':
    main() 