from functools import wraps
from flask import jsonify, request, current_app, session

def login_required_or_bearer_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        token_valid = False
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                if token == current_app.config['AUTH_TOKEN']:
                    token_valid = True
            except IndexError:
                return jsonify({'error': 'Invalid token'}), 400
        
        # Check for user session
        user_logged_in = 'user_id' in session
        
        if not token_valid and not user_logged_in:
            return jsonify({'error': 'Unauthorized access. Login required or provide a valid token.'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized access. Login required.'}), 403
        return f(*args, **kwargs)
    return decorated_function
