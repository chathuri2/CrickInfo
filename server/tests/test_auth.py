import pytest
from flask import json
from app import create_app, db
from models import User, UserRole

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test runner"""
    return app.test_cli_runner()

class TestAuth:
    """Test authentication endpoints"""
    
    def test_register_user(self, client):
        """Test user registration"""
        response = client.post('/api/auth/register',
                             json={
                                 'username': 'testuser',
                                 'email': 'test@example.com',
                                 'password': 'testpass123'
                             })
        data = json.loads(response.data)
        
        assert response.status_code == 201
        assert data['message'] == 'User registered successfully'
        assert 'access_token' in data
        assert data['user']['username'] == 'testuser'
    
    def test_register_duplicate_username(self, client):
        """Test registration with duplicate username"""
        # Register first user
        client.post('/api/auth/register',
                   json={
                       'username': 'testuser',
                       'email': 'test1@example.com',
                       'password': 'testpass123'
                   })
        
        # Try to register with same username
        response = client.post('/api/auth/register',
                             json={
                                 'username': 'testuser',
                                 'email': 'test2@example.com',
                                 'password': 'testpass123'
                             })
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert 'Username already exists' in data['error']
    
    def test_login_valid_credentials(self, client):
        """Test login with valid credentials"""
        # Register user first
        client.post('/api/auth/register',
                   json={
                       'username': 'testuser',
                       'email': 'test@example.com',
                       'password': 'testpass123'
                   })
        
        # Login
        response = client.post('/api/auth/login',
                             json={
                                 'username': 'testuser',
                                 'password': 'testpass123'
                             })
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['message'] == 'Login successful'
        assert 'access_token' in data
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post('/api/auth/login',
                             json={
                                 'username': 'nonexistent',
                                 'password': 'wrongpass'
                             })
        data = json.loads(response.data)
        
        assert response.status_code == 401
        assert 'Invalid username or password' in data['error']
    
    def test_get_profile_with_token(self, client):
        """Test getting profile with valid token"""
        # Register and login to get token
        client.post('/api/auth/register',
                   json={
                       'username': 'testuser',
                       'email': 'test@example.com',
                       'password': 'testpass123'
                   })
        
        login_response = client.post('/api/auth/login',
                                   json={
                                       'username': 'testuser',
                                       'password': 'testpass123'
                                   })
        token = json.loads(login_response.data)['access_token']
        
        # Get profile
        response = client.get('/api/auth/profile',
                            headers={'Authorization': f'Bearer {token}'})
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['user']['username'] == 'testuser'
    
    def test_get_profile_without_token(self, client):
        """Test getting profile without token"""
        response = client.get('/api/auth/profile')
        
        assert response.status_code == 401
    
    def test_change_password(self, client):
        """Test password change"""
        # Register and login to get token
        client.post('/api/auth/register',
                   json={
                       'username': 'testuser',
                       'email': 'test@example.com',
                       'password': 'testpass123'
                   })
        
        login_response = client.post('/api/auth/login',
                                   json={
                                       'username': 'testuser',
                                       'password': 'testpass123'
                                   })
        token = json.loads(login_response.data)['access_token']
        
        # Change password
        response = client.post('/api/auth/change-password',
                             headers={'Authorization': f'Bearer {token}'},
                             json={
                                 'current_password': 'testpass123',
                                 'new_password': 'newpass456'
                             })
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['message'] == 'Password changed successfully' 