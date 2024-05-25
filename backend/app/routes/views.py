from flask import Blueprint, jsonify


main = Blueprint('main', __name__)
@main.route('/test', methods=['GET'])
#@login_required_or_bearer_token
def test():
    return jsonify({"hello": "fawedaw"}), 200