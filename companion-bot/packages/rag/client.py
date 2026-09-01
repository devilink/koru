import uuid
from typing import List, Dict, Optional
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

class LocalRAG:
    def __init__(self, qdrant_url: str = "http://localhost:6333", collection_name: str = "companion_memory"):
        self.client = QdrantClient(url=qdrant_url)
        self.collection_name = collection_name
        
        # Use bge-small-en-v1.5 as requested
        model_name = "BAAI/bge-small-en-v1.5"
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': True}
        self.embeddings = HuggingFaceBgeEmbeddings(
            model_name=model_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections()
            if not any(c.name == self.collection_name for c in collections.collections):
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
                )
        except Exception as e:
            print(f"Warning: Failed to connect to Qdrant at init: {e}")

    def add_document(self, title: str, content: str):
        """
        Store a document in Qdrant with title metadata for citations.
        """
        vec = self.embeddings.embed_query(content)
        point_id = str(uuid.uuid4())
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=point_id,
                    vector=vec,
                    payload={"title": title, "content": content}
                )
            ]
        )

    def retrieve(self, query: str, limit: int = 3) -> List[Dict]:
        """
        Search for relevant local documents.
        """
        try:
            vec = self.embeddings.embed_query(query)
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=vec,
                limit=limit
            )
            return [
                {
                    "title": hit.payload.get("title", "Unknown"),
                    "content": hit.payload.get("content", ""),
                    "score": hit.score
                }
                for hit in results if hit.score > 0.6
            ]
        except Exception as e:
            print(f"Failed to retrieve from Qdrant: {e}")
            return []
