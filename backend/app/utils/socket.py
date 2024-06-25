
from app import redis_client
from secrets import token_hex

SOCKET_TOKEN_PREFIX = 'socket:token:' # Valid tokens
SOCKET_ID_PREFIX = 'socket:id:' # Active sessions
SOCKET_TOKEN_EXPIRY_TIME = 60 * 3 # 3 minutes
def generate_socket_token(type: str, user_id: int, site_id: int) -> str:
  token = token_hex(16)
  # Store token in redis with an expiration of 15 minutes.
  key = f"{SOCKET_TOKEN_PREFIX}{token}"
  
  print(f"[generate_socket_token] -> Generating token: '{token}' '{type}' '{user_id}' '{site_id}'")
  
  redis_client.setex(key, SOCKET_TOKEN_EXPIRY_TIME, f"{type}:{user_id}:{site_id}")
  return token

def verify_socket_token(incoming_type: str, token: str, incoming_site_id: int,) -> bool:  
  key = f"{SOCKET_TOKEN_PREFIX}{token}"

  token_data = redis_client.get(key)
  
  if not token_data:
    raise Exception("Invalid token")
  
  token_type, token_user_id, token_site_id = token_data.decode('utf-8').split(':')
  print(f"[verify_socket_token] -> Token data: {token_type} {token_user_id} {token_site_id}")
  if token_type != incoming_type or incoming_site_id != int(token_site_id):
      raise Exception("Token is not authorized")
    
  print(f"[verify_socket_token] -> Token verified: {token_type} {token_user_id} {token_site_id}")
    
  return token_type, int(token_user_id), int(token_site_id)
    
def store_socket_id_data(socket_id: str, room: str):
  redis_client.setex(f"{SOCKET_ID_PREFIX}{socket_id}", SOCKET_TOKEN_EXPIRY_TIME, room)
  
def get_socket_id_data(socket_id: str) -> tuple:
    key = f"{SOCKET_ID_PREFIX}{socket_id}"
    
    with redis_client.pipeline() as pipe:
        pipe.get(key)
        pipe.ttl(key)
        token_data, remaining_ttl = pipe.execute()
    
    if not token_data:
        raise Exception("Invalid socket id")
    
    # user_id, site_id, room = token_data.decode('utf-8').split(':')
    room = token_data.decode('utf-8')
    
    # return int(user_id), int(site_id), room, remaining_ttl
    return room, remaining_ttl
