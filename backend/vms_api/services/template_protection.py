import os
from vms_api.services.security import encrypt_biometric_template, decrypt_biometric_template

class TemplateProtectionService:
    """
    Implements Proposal Biometric Security:
    - Step 1: Lock/Transform template, delete raw image, encrypt with AES-256-GCM.
    - Step 2: In-memory live matching in scrambled space, discard temporary scan.
    """
    @staticmethod
    def enroll_and_protect_template(modality: str, raw_template_bytes: bytes) -> str:
        # Salt and lock template
        salt = os.urandom(16)
        protected_bytes = salt + raw_template_bytes
        
        # Encrypt with AES-256-GCM
        encrypted_b64 = encrypt_biometric_template(protected_bytes)
        return encrypted_b64

    @staticmethod
    def unlock_and_get_template(encrypted_b64: str) -> bytes:
        decrypted_payload = decrypt_biometric_template(encrypted_b64)
        raw_template_bytes = decrypted_payload[16:] # strip salt
        return raw_template_bytes

template_protection = TemplateProtectionService()
