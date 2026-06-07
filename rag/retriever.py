from __future__ import annotations

import asyncio

import chromadb


async def retrieve_resume_chunks(query: str, top_k: int = 5, user_id: str | None = None) -> dict:
    try:
        def _query() -> list[dict]:
            client = chromadb.PersistentClient(path="./chroma_db")
            collection = client.get_or_create_collection(name="resume_chunks")
            count = collection.count()
            if count == 0:
                return []
            where = {"user_id": user_id} if user_id else None
            results = collection.query(
                query_texts=[query], n_results=min(top_k, count), where=where
            )
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            return [
                {"text": doc, "metadata": meta}
                for doc, meta in zip(docs, metas)
            ]

        chunks = await asyncio.to_thread(_query)
        return {"chunks": chunks}
    except Exception as exc:
        return {"error": f"Chroma retrieval failed: {exc}"}
