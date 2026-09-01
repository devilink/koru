import os
import pytest
import numpy as np
from cryptography.fernet import Fernet
from packages.perception.enrollment import FaceEmbeddingManager

@pytest.fixture
def temp_manager(tmp_path):
    key = Fernet.generate_key()
    storage = tmp_path / "test_embeddings.enc"
    manager = FaceEmbeddingManager(key, str(storage))
    return manager

def test_enroll_and_match(temp_manager):
    # Dummy embedding for Alice
    alice_emb = np.array([0.1, 0.2, 0.3, 0.4])
    temp_manager.enroll_member("alice", alice_emb, delete_raw=True)
    
    # Test Exact match
    match = temp_manager.match_face(alice_emb, threshold=0.99)
    assert match == "alice"
    
    # Test Mismatch
    bob_emb = np.array([-0.1, -0.2, -0.3, -0.4])
    match = temp_manager.match_face(bob_emb, threshold=0.5)
    assert match is None

def test_delete_member(temp_manager):
    alice_emb = np.array([0.1, 0.2, 0.3, 0.4])
    temp_manager.enroll_member("alice", alice_emb)
    
    temp_manager.delete_member("alice")
    match = temp_manager.match_face(alice_emb, threshold=0.5)
    assert match is None
