"""
RAG Service
Retrieval Augmented Generation using ChromaDB and HuggingFace embeddings
All retrievals are traced via LangSmith for latency and result monitoring
"""

import time
import chromadb
from chromadb.config import Settings as ChromaSettings
import logging
from typing import List, Optional
from config import settings
from services.langsmith_service import monitor, traceable
import os

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG-powered contract analysis"""

    def __init__(self):
        # Ensure ChromaDB directory exists
        os.makedirs(settings.CHROMADB_PATH, exist_ok=True)

        # Initialize ChromaDB client (persistent)
        self.client = chromadb.PersistentClient(
            path=settings.CHROMADB_PATH
        )

        # Get or create collection
        try:
            self.collection = self.client.get_collection(
                name=settings.CHROMADB_COLLECTION_NAME
            )
            logger.info(f"Connected to existing ChromaDB collection")
        except Exception as e:
            logger.info(f"Creating new ChromaDB collection: {str(e)}")
            self.collection = self.client.create_collection(
                name=settings.CHROMADB_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )

        self.is_initialized = False

    def initialize_knowledge_base(self) -> None:
        """
        Load FTC guidelines and sample contracts into ChromaDB
        Call this once at startup
        """
        if self.is_initialized:
            logger.info("Knowledge base already initialized")
            return

        try:
            # Check if knowledge base already has documents
            count = self.collection.count()
            if count > 0:
                logger.info(f"Knowledge base already has {count} documents")
                self.is_initialized = True
                return

            # Load FTC guidelines
            ftc_path = os.path.join(settings.RAG_DATA_PATH, "knowledge_base", "ftc_guidelines.md")
            if os.path.exists(ftc_path):
                with open(ftc_path, "r", encoding="utf-8", errors="ignore") as f:
                    ftc_content = f.read()

                # Split into chunks and add to ChromaDB
                chunks = self._chunk_text(ftc_content, chunk_size=500)
                for i, chunk in enumerate(chunks):
                    self.collection.add(
                        ids=[f"ftc_guideline_{i}"],
                        documents=[chunk],
                        metadatas=[{"source": "FTC Endorsement Guides", "type": "legal"}]
                    )
                logger.info(f"Added {len(chunks)} FTC guideline chunks to ChromaDB")

            # Load sample contract templates
            sample_contracts_path = os.path.join(settings.RAG_DATA_PATH, "knowledge_base", "sample_contracts.md")
            if os.path.exists(sample_contracts_path):
                with open(sample_contracts_path, "r", encoding="utf-8", errors="ignore") as f:
                    contracts_content = f.read()

                chunks = self._chunk_text(contracts_content, chunk_size=500)
                for i, chunk in enumerate(chunks):
                    self.collection.add(
                        ids=[f"sample_contract_{i}"],
                        documents=[chunk],
                        metadatas=[{"source": "Sample Contracts", "type": "template"}]
                    )
                logger.info(f"Added {len(chunks)} sample contract chunks to ChromaDB")

            # Load red-flag patterns
            red_flags_path = os.path.join(settings.RAG_DATA_PATH, "knowledge_base", "red_flags.md")
            if os.path.exists(red_flags_path):
                with open(red_flags_path, "r", encoding="utf-8", errors="ignore") as f:
                    red_flags_content = f.read()

                chunks = self._chunk_text(red_flags_content, chunk_size=300)
                for i, chunk in enumerate(chunks):
                    self.collection.add(
                        ids=[f"red_flag_{i}"],
                        documents=[chunk],
                        metadatas=[{"source": "Red Flag Library", "type": "warning"}]
                    )
                logger.info(f"Added {len(chunks)} red-flag chunks to ChromaDB")

            self.is_initialized = True
            logger.info("Knowledge base initialization complete")

        except Exception as e:
            logger.error(f"Error initializing knowledge base: {str(e)}")
            raise

    @traceable(name="rag_retrieve_documents", run_type="retriever", tags=["rag", "chromadb"])
    def retrieve_relevant_documents(
        self,
        query: str,
        n_results: int = 3
    ) -> List[str]:
        """
        Retrieve relevant documents from ChromaDB for a given query.
        Traced to LangSmith with latency and result count.
        """
        start = time.time()
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )

            documents = []
            if results and "documents" in results and results["documents"]:
                for docs, metadata_list in zip(results["documents"], results["metadatas"]):
                    for doc, metadata in zip(docs, metadata_list):
                        documents.append({
                            "content": doc,
                            "source": metadata.get("source", "Unknown"),
                            "type": metadata.get("type", "Unknown")
                        })

            latency_ms = (time.time() - start) * 1000
            monitor.log_rag_retrieval(
                query=query,
                n_results=n_results,
                documents_found=len(documents),
                latency_ms=latency_ms,
                metadata={"collection": settings.CHROMADB_COLLECTION_NAME},
            )

            logger.info(f"✅ RAG retrieved {len(documents)} documents from ChromaDB")
            return documents

        except Exception as e:
            latency_ms = (time.time() - start) * 1000
            monitor.log_rag_retrieval(
                query=query,
                n_results=n_results,
                documents_found=0,
                latency_ms=latency_ms,
                metadata={"error": str(e)},
            )
            logger.error(f"❌ Error retrieving documents from ChromaDB: {str(e)}")
            return []

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks

        Args:
            text: Text to chunk
            chunk_size: Size of each chunk
            overlap: Overlap between chunks

        Returns:
            List of text chunks
        """
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)

        return chunks

    def search_contracts(self, keywords: str, n_results: int = 5) -> List[dict]:
        """
        Search for contracts or clauses by keyword

        Args:
            keywords: Search terms
            n_results: Number of results

        Returns:
            Matching documents
        """
        results = self.collection.query(
            query_texts=[keywords],
            n_results=n_results,
            where={"type": "template"}
        )

        documents = []
        if results and "documents" in results and results["documents"]:
            for docs, metadata_list in zip(results["documents"], results["metadatas"]):
                for doc, metadata in zip(docs, metadata_list):
                    documents.append({
                        "content": doc,
                        "source": metadata.get("source", "Unknown")
                    })

        return documents


# Singleton instance
rag_service = RAGService()
