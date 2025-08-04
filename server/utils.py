import re
import hashlib
import random
import string
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from flask import jsonify, request
from marshmallow import ValidationError

def generate_random_string(length: int = 8) -> str:
    """Generate a random string of specified length"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def hash_password(password: str) -> str:
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength and return detailed feedback"""
    errors = []
    warnings = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    elif len(password) < 12:
        warnings.append("Consider using a longer password (12+ characters)")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        warnings.append("Consider adding special characters for better security")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'score': calculate_password_score(password)
    }

def calculate_password_score(password: str) -> int:
    """Calculate password strength score (0-100)"""
    score = 0
    
    # Length score
    if len(password) >= 8:
        score += 20
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 10
    
    # Character variety score
    if re.search(r'[a-z]', password):
        score += 10
    if re.search(r'[A-Z]', password):
        score += 10
    if re.search(r'\d', password):
        score += 10
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 10
    
    # Complexity bonus
    unique_chars = len(set(password))
    if unique_chars >= 8:
        score += 10
    if unique_chars >= 12:
        score += 10
    
    return min(100, score)

def format_response(data: Any = None, message: str = "Success", status_code: int = 200) -> tuple:
    """Format API response"""
    response = {
        'message': message,
        'status': 'success' if status_code < 400 else 'error',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    return jsonify(response), status_code

def format_error_response(error: str, message: str = None, status_code: int = 400) -> tuple:
    """Format error response"""
    response = {
        'error': error,
        'status': 'error',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if message:
        response['message'] = message
    
    return jsonify(response), status_code

def validate_pagination_params(page: int, per_page: int, max_per_page: int = 100) -> Dict[str, int]:
    """Validate and sanitize pagination parameters"""
    page = max(1, page)
    per_page = max(1, min(per_page, max_per_page))
    
    return {
        'page': page,
        'per_page': per_page,
        'offset': (page - 1) * per_page
    }

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    if not text:
        return text
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&']
    for char in dangerous_chars:
        text = text.replace(char, '')
    
    return text.strip()

def validate_file_upload(file, allowed_extensions: List[str], max_size: int = 16 * 1024 * 1024) -> Dict[str, Any]:
    """Validate file upload"""
    if not file:
        return {'is_valid': False, 'error': 'No file provided'}
    
    # Check file size
    if len(file.read()) > max_size:
        file.seek(0)  # Reset file pointer
        return {'is_valid': False, 'error': f'File size exceeds {max_size / (1024*1024)}MB limit'}
    
    file.seek(0)  # Reset file pointer
    
    # Check file extension
    filename = file.filename
    if not filename:
        return {'is_valid': False, 'error': 'Invalid filename'}
    
    file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if file_extension not in allowed_extensions:
        return {
            'is_valid': False, 
            'error': f'File type not allowed. Allowed types: {", ".join(allowed_extensions)}'
        }
    
    return {'is_valid': True, 'filename': filename, 'extension': file_extension}

def calculate_age(birth_date: datetime) -> int:
    """Calculate age from birth date"""
    today = datetime.now()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def format_duration(seconds: int) -> str:
    """Format duration in seconds to human readable string"""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        return f"{hours}h {remaining_minutes}m"

def parse_date_range(date_range: str) -> tuple:
    """Parse date range string (e.g., '2024-01-01:2024-12-31')"""
    try:
        start_date_str, end_date_str = date_range.split(':')
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        return start_date, end_date
    except (ValueError, AttributeError):
        raise ValidationError('Invalid date range format. Use YYYY-MM-DD:YYYY-MM-DD')

def generate_api_key() -> str:
    """Generate a secure API key"""
    return hashlib.sha256(
        f"{datetime.utcnow().isoformat()}{generate_random_string(16)}".encode()
    ).hexdigest()

def validate_json_schema(data: Dict, required_fields: List[str], optional_fields: List[str] = None) -> Dict[str, Any]:
    """Validate JSON data against a schema"""
    errors = []
    missing_fields = []
    
    # Check required fields
    for field in required_fields:
        if field not in data or data[field] is None:
            missing_fields.append(field)
    
    if missing_fields:
        errors.append(f"Missing required fields: {', '.join(missing_fields)}")
    
    # Check for unknown fields
    if optional_fields:
        allowed_fields = set(required_fields + optional_fields)
        unknown_fields = set(data.keys()) - allowed_fields
        if unknown_fields:
            errors.append(f"Unknown fields: {', '.join(unknown_fields)}")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors,
        'missing_fields': missing_fields
    }

def rate_limit_key():
    """Generate rate limit key based on IP and user"""
    user_id = getattr(request, 'user_id', None)
    if user_id:
        return f"rate_limit:{user_id}"
    return f"rate_limit:{request.remote_addr}"

def log_activity(user_id: int, action: str, details: Dict = None):
    """Log user activity (placeholder for logging system)"""
    log_entry = {
        'user_id': user_id,
        'action': action,
        'details': details or {},
        'timestamp': datetime.utcnow().isoformat(),
        'ip_address': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', '')
    }
    
    # In a real application, you would save this to a database or log file
    print(f"Activity Log: {log_entry}")

def calculate_statistics(data: List[float]) -> Dict[str, float]:
    """Calculate basic statistics from a list of numbers"""
    if not data:
        return {
            'count': 0,
            'mean': 0,
            'median': 0,
            'min': 0,
            'max': 0,
            'std_dev': 0
        }
    
    sorted_data = sorted(data)
    count = len(data)
    mean = sum(data) / count
    median = sorted_data[count // 2] if count % 2 == 1 else (sorted_data[count // 2 - 1] + sorted_data[count // 2]) / 2
    min_val = min(data)
    max_val = max(data)
    
    # Calculate standard deviation
    variance = sum((x - mean) ** 2 for x in data) / count
    std_dev = variance ** 0.5
    
    return {
        'count': count,
        'mean': round(mean, 2),
        'median': round(median, 2),
        'min': min_val,
        'max': max_val,
        'std_dev': round(std_dev, 2)
    } 