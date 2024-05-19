from app.utils.decorators import login_required_or_bearer_token, login_required
from flask import Blueprint, jsonify, request, session
from app import db, chroma_client
from app.models.models import Site, User
from app.utils.validation import validate_form
from langchain_chroma import Chroma
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import CharacterTextSplitter

chat = Blueprint('site', __name__)

# @chat.route('/<int:site_id>', methods=['POST'])
# @login_required
# def chat(site_id):
#     """
#     This endpoint is used to ask a question to the chatbot.
#     """
#     user_id = session["user_id"]
    
#     json = request.get_json(silent=True)
#     query = json["query"]
    
#     #form = validate_form(CreateForm, request.get_json(silent=True))
#     #name = form.name.data
#     langchain_chroma = Chroma(
#     client=chroma_client,
#     collection_name=f"{site_id}_{user_id}",
#     embedding_function=embedding_function,
# )

#     docs = db.similarity_search(query)

#     return jsonify({"message": "Site created successfully"}), 201
