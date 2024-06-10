
from app import redis_client
from secrets import token_hex

SOCKET_TOKEN_PREFIX = 'socket:token:' # Valid tokens
SOCKET_ID_PREFIX = 'socket:id:' # Active sessions
SOCKET_TOKEN_EXPIRY_TIME = 15 * 60 # 15 minutes
def generate_socket_token(type: str, user_id: int, site_id: int) -> str:
  token = token_hex(16)
  # Store token in redis with an expiration of 15 minutes.
  redis_client.setex(f"{SOCKET_TOKEN_PREFIX}{token}", SOCKET_TOKEN_EXPIRY_TIME, f"{type}:{user_id}:{site_id}")
  return token

def verify_socket_token(token: str, incoming_site_id: int, incoming_type: str) -> bool:
  token_data = redis_client.get(f"{SOCKET_TOKEN_PREFIX}{token}")
  
  if not token_data:
    raise Exception("Invalid token")
  
  token_type, token_user_id, token_site_id = token_data.decode('utf-8').split(':')
  if token_type != incoming_type or incoming_site_id != int(token_site_id):
      raise Exception("Invalid token")
    
  return token_type, int(token_user_id), int(token_site_id)
    
def store_socket_id_data(socket_id: str, user_id: int, site_id: int):
  redis_client.setex(f"{SOCKET_ID_PREFIX}{socket_id}", SOCKET_TOKEN_EXPIRY_TIME, f"{user_id}:{site_id}")
  
def get_socket_id_data(socket_id: str) -> tuple:
  token_data = redis_client.get(f"{SOCKET_ID_PREFIX}{socket_id}")
  if not token_data:
    raise Exception("Invalid socket id")
  
  user_id, site_id = token_data.decode('utf-8').split(':')
  
  return int(user_id), int(site_id)