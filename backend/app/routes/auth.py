from app.utils.decorators import login_required
from flask import Blueprint, jsonify, request, session
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity
)
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import User
from app.validation.auth import RegisterForm, LoginForm, UpdateForm
from app.utils.validation import validate_form
from datetime import timedelta

auth = Blueprint('auth', __name__)

ACCESS_TOKEN_RETENTION_SECONDS = 60 * 1 # 1 minute
REFRESH_TOKEN_RETENTION_SECONDS = 60 * 60 * 24 * 30 # 30 days

@auth.route('/register', methods=['POST'])
def register():
    form = validate_form(RegisterForm, request.get_json(silent=True))
    
    email = form.email.data
    password = form.password.data
    
    # Check if the user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    # Create new user
    hashed_password = generate_password_hash(password, method='pbkdf2')
    new_user = User(email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()
    
    # Generate tokens for the newly registered user
    access_token = create_access_token(identity=new_user.id, expires_delta=timedelta(seconds=ACCESS_TOKEN_RETENTION_SECONDS))
    refresh_token = create_refresh_token(identity=new_user.id, expires_delta=timedelta(seconds=REFRESH_TOKEN_RETENTION_SECONDS))
    
    return (
        jsonify(
            {
                "message": "User created successfully",
                "data": {
                    "access_token": {
                        "value": access_token,
                        "max_age": ACCESS_TOKEN_RETENTION_SECONDS,
                    },
                    "refresh_token": {
                        "value": refresh_token,
                        "max_age": REFRESH_TOKEN_RETENTION_SECONDS,
                    },
                }
            }
        ),
        201,
    )
    
@auth.route('/login', methods=['POST'])
def login():
    form = validate_form(LoginForm, request.get_json(silent=True))

    email = form.email.data
    password = form.password.data

    # Find user by email
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user.id, expires_delta=timedelta(seconds=ACCESS_TOKEN_RETENTION_SECONDS))
    refresh_token = create_refresh_token(identity=user.id, expires_delta=timedelta(seconds=REFRESH_TOKEN_RETENTION_SECONDS))
    
    return (
        jsonify(
            {
                "data": {
                    "access_token": {
                        "value": access_token,
                        "max_age": ACCESS_TOKEN_RETENTION_SECONDS,
                    },
                    "refresh_token": {
                        "value": refresh_token,
                        "max_age": REFRESH_TOKEN_RETENTION_SECONDS,
                    },
                }
            }
        ),
        200,
    )

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(seconds=ACCESS_TOKEN_RETENTION_SECONDS))
    return jsonify({'data': 
      {'access_token': {
        'value': access_token, 
        'max_age': ACCESS_TOKEN_RETENTION_SECONDS
      }}}), 200
    
@auth.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    return jsonify({'email': user.email}), 200

@auth.route("/update", methods=["PATCH"])
@login_required
def update():
    form = validate_form(UpdateForm, request.get_json(silent=True))
    
    old_password = form.old_password.data
    new_password = form.password.data
    email = form.email.data
    
    user = User.query.filter_by(id=session["user_id"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if old_password and new_password:
        if not check_password_hash(user.password_hash, old_password):
            return jsonify({"error": "Old password is incorrect"}), 400
        user.password_hash = generate_password_hash(new_password, method='pbkdf2')
    
    if email:
        user.email = email
    
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200
