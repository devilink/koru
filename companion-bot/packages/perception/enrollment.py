import json
import os
from typing import Dict, List, Optional
from cryptography.fernet import Fernet
import numpy as np

class FaceEmbeddingManager:
    def __init__(self, key: bytes, storage_path: str = "./data/embeddings.enc"):
        self.fernet = Fernet(key)
        self.storage_path = storage_path
        self._cache: Dict[str, List[float]] = {}
        self._load()

    def _load(self):
        if not os.path.exists(self.storage_path):
            self._cache = {}
            return
            
        with open(self.storage_path, "rb") as f:
            encrypted_data = f.read()
            
        try:
            decrypted = self.fernet.decrypt(encrypted_data)
            self._cache = json.loads(decrypted.decode('utf-8'))
        except Exception as e:
            print(f"Failed to decrypt embeddings: {e}")
            self._cache = {}

    def _save(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        data = json.dumps(self._cache).encode('utf-8')
        encrypted = self.fernet.encrypt(data)
        with open(self.storage_path, "wb") as f:
            f.write(encrypted)

    def enroll_member(self, member_id: str, embedding: np.ndarray, delete_raw: bool = True):
        """
        Save an encrypted face embedding.
        Raw image deletion should be handled by the caller, but the flag indicates intent.
        """
        self._cache[member_id] = embedding.tolist()
        self._save()
        if delete_raw:
            print(f"Intent logged: Raw image for {member_id} should be deleted from disk.")

    def delete_member(self, member_id: str):
        if member_id in self._cache:
            del self._cache[member_id]
            self._save()

    def match_face(self, target_embedding: np.ndarray, threshold: float = 0.6) -> Optional[str]:
        """
        Cosine similarity match against enrolled members.
        """
        if not self._cache:
            return None
            
        best_match = None
        best_score = -1.0
        
        target_norm = np.linalg.norm(target_embedding)
        if target_norm == 0:
            return None
            
        for member_id, emb_list in self._cache.items():
            emb = np.array(emb_list)
            emb_norm = np.linalg.norm(emb)
            if emb_norm == 0:
                continue
                
            similarity = np.dot(target_embedding, emb) / (target_norm * emb_norm)
            if similarity > best_score and similarity >= threshold:
                best_score = similarity
                best_match = member_id
                
        return best_match
