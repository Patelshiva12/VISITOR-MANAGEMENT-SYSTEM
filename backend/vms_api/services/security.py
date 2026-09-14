import os
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings

def get_aes_key() -> bytes:
    key_hex = getattr(settings, 'BIOMETRIC_VAULT_KEY', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')[:64]
    return bytes.fromhex(key_hex.ljust(64, '0'))

def encrypt_biometric_template(raw_template_bytes: bytes) -> str:
    """
    Transforms raw mathematical template and encrypts using AES-256-GCM.
    Returns Base64 encoded string containing (Nonce + Ciphertext + Tag).
    """
    key = get_aes_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12) # 96-bit standard GCM nonce
    ciphertext = aesgcm.encrypt(nonce, raw_template_bytes, None)
    payload = nonce + ciphertext
    return base64.b64encode(payload).decode('utf-8')

def decrypt_biometric_template(encrypted_b64: str) -> bytes:
    """
    Decrypts stored AES-256-GCM template back to in-memory feature vector bytes.
    """
    key = get_aes_key()
    aesgcm = AESGCM(key)
    payload = base64.b64decode(encrypted_b64.encode('utf-8'))
    nonce = payload[:12]
    ciphertext = payload[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        hours = getattr(settings, 'JWT_EXPIRATION_HOURS', 24)
        expire = datetime.now(timezone.utc) + timedelta(hours=hours)
    
    to_encode = {"exp": expire, "sub": str(subject), "role": role}
    secret_key = getattr(settings, 'SECRET_KEY', 'django-insecure-key')
    algorithm = getattr(settings, 'JWT_ALGORITHM', 'HS256')
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        secret_key = getattr(settings, 'SECRET_KEY', 'django-insecure-key')
        algorithm = getattr(settings, 'JWT_ALGORITHM', 'HS256')
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except Exception:
        return None
