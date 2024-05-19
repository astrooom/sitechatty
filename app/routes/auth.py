from app.utils.decorators import login_required
from flask import Blueprint, jsonify, request, session, current_app
import jwt
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import User
from app.validation.auth import RegisterForm, LoginForm, UpdateForm
from app.utils.validation import validate_form

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    form = validate_form(RegisterForm, request.get_json(silent=True))
    
    username = form.username.data
    email = form.email.data
    password = form.password.data
    
    # Create new user
    hashed_password = generate_password_hash(password, method='pbkdf2')
    new_user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': new_user.id,
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'message': 'User created successfully', 'token': token}), 201

@auth.route('/login', methods=['POST'])
def login():
    form = validate_form(LoginForm, request.get_json(silent=True))

    email = form.email.data
    password = form.password.data

    # Find user by email
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Set user_id in session
    session['user_id'] = user.id

    return jsonify({'message': 'Login successful'}), 200 

@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth.route('/me', methods=['GET'])
@login_required
def me():
    user = User.query.filter_by(id=session['user_id']).first()
    return jsonify({'username': user.username, 'email': user.email})

@auth.route("/update", methods=["PATCH"])
@login_required
def update():
    form = validate_form(UpdateForm, request.get_json(silent=True))
    
    old_password = form.old_password.data
    new_password = form.password.data
    username = form.username.data
    email = form.email.data
    
    user = User.query.filter_by(id=session["user_id"]).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if old_password and new_password:
        if not check_password_hash(user.password_hash, old_password):
            return jsonify({"error": "Old password is incorrect"}), 400
        user.password_hash = generate_password_hash(new_password, method='pbkdf2')

    if username:
        user.username = username
    
    if email:
        user.email = email
    
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200
