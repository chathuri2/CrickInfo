# CrickInfo Backend API

A professional Flask-based REST API for cricket information management, featuring player statistics, squad management, smart suggestions, and comprehensive analytics.

## 🏏 Features

- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **Player Management** - CRUD operations for cricket players with detailed statistics
- **Squad Management** - Create, manage, and validate cricket squads
- **Smart Suggestions** - AI-powered player recommendations based on match conditions
- **Statistics & Analytics** - Comprehensive player and squad analysis
- **Admin Panel** - Administrative functions for system management
- **RESTful API** - Well-structured REST endpoints with proper error handling
- **Database Support** - SQLAlchemy ORM with support for SQLite and PostgreSQL
- **Security** - Password hashing, input validation, and CORS protection

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip or conda
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CrickInfo-main/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

5. **Run the application**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

### Player Endpoints

#### Get All Players
```http
GET /api/players?page=1&per_page=20&role=Batsman&country=India&search=virat
```

#### Get Player Details
```http
GET /api/players/{player_id}
```

#### Create Player (Admin Only)
```http
POST /api/players
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Virat Kohli",
  "role": "Batsman",
  "country": "India",
  "matches_played": 254
}
```

### Squad Endpoints

#### Create Squad
```http
POST /api/squads
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "India T20 Squad",
  "captain_id": 1,
  "wicket_keeper_id": 4
}
```

#### Add Player to Squad
```http
POST /api/squads/{squad_id}/players
Authorization: Bearer {token}
Content-Type: application/json

{
  "player_id": 1
}
```

#### Validate Squad
```http
GET /api/squads/{squad_id}/validate
Authorization: Bearer {token}
```

### Statistics Endpoints

#### Generate Smart Suggestions
```http
POST /api/statistics/smart-suggestion
Authorization: Bearer {token}
Content-Type: application/json

{
  "squad_id": 1,
  "match_conditions_id": 1
}
```

#### Analyze Squad
```http
POST /api/statistics/squad-analysis
Authorization: Bearer {token}
Content-Type: application/json

{
  "squad_id": 1,
  "match_conditions_id": 1
}
```

#### Get Top Players
```http
GET /api/statistics/top-players?format=T20&role=Batsman&limit=10
```

### Admin Endpoints

#### Get System Statistics
```http
GET /api/admin/statistics
Authorization: Bearer {admin_token}
```

#### Bulk Import Players
```http
POST /api/admin/players/bulk-import
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "players": [
    {
      "name": "Rohit Sharma",
      "role": "Batsman",
      "country": "India",
      "matches_played": 233
    }
  ]
}
```

## 🗄️ Database Schema

### Core Tables

- **users** - User accounts and authentication
- **players** - Cricket player information
- **player_statistics** - Player performance statistics by format
- **squads** - User-created cricket squads
- **squad_players** - Many-to-many relationship between squads and players
- **match_conditions** - Match format, pitch, and weather conditions
- **smart_suggestions** - AI-generated player recommendations
- **suggestion_players** - Players recommended in smart suggestions

### Relationships

- Users can have multiple squads
- Squads can have multiple players
- Players can have statistics for different match formats
- Smart suggestions are linked to squads and match conditions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Application environment | `development` |
| `DATABASE_URL` | Database connection string | `sqlite:///crickinfo.db` |
| `SECRET_KEY` | Flask secret key | Auto-generated |
| `JWT_SECRET_KEY` | JWT signing key | Auto-generated |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `5000` |

### Database Setup

The application supports multiple database backends:

- **SQLite** (default) - Good for development and small deployments
- **PostgreSQL** - Recommended for production

To use PostgreSQL:
```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost/crickinfo
```

## 🧪 Testing

Run the test suite:
```bash
python -m pytest tests/
```

Run with coverage:
```bash
python -m pytest --cov=. tests/
```

## 📦 Deployment

### Development
```bash
python run.py
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "run:app"]
```

## 🔒 Security Features

- **Password Hashing** - Bcrypt for secure password storage
- **JWT Authentication** - Stateless authentication with refresh tokens
- **Input Validation** - Marshmallow schemas for request validation
- **CORS Protection** - Configurable cross-origin resource sharing
- **Rate Limiting** - API rate limiting to prevent abuse
- **SQL Injection Protection** - SQLAlchemy ORM with parameterized queries
- **XSS Protection** - Input sanitization and secure headers

## 📊 Monitoring & Logging

The application includes comprehensive logging and monitoring:

- **Request Logging** - All API requests are logged
- **Error Tracking** - Detailed error logging with stack traces
- **Performance Monitoring** - Response time tracking
- **Health Checks** - System health monitoring endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added smart suggestions and analytics
- **v1.2.0** - Enhanced security and performance improvements

---

**Built with ❤️ for cricket enthusiasts** 