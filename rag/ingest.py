from __future__ import annotations

import asyncio

from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb


async def ingest_resume_text(user_id: str, resume_id: str, text: str) -> dict:
    try:
        def _ingest() -> int:
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = splitter.split_text(text)
            client = chromadb.PersistentClient(path="./chroma_db")
            collection = client.get_or_create_collection(name="resume_chunks")
            ids = [f"{resume_id}_{idx}" for idx in range(len(chunks))]
            metadatas = [
                {"user_id": user_id, "resume_id": resume_id, "chunk_index": idx}
                for idx in range(len(chunks))
            ]
            collection.upsert(ids=ids, documents=chunks, metadatas=metadatas)
            return len(chunks)

        chunk_count = await asyncio.to_thread(_ingest)
        return {"status": "ok", "chunks": chunk_count}
    except Exception as exc:
        return {"error": f"Chroma ingest failed: {exc}"}
