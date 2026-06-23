# Copy this file to your QAMindWorker folder:
#   C:\Users\Admin\OneDrive\Attachments\Desktop\QAMindWorker\chat_endpoint.py
#
# Then add these 2 lines at the BOTTOM of main.py (after app = FastAPI(...)):
#
#   from chat_endpoint import register_chat_routes
#   register_chat_routes(app)
#
# Restart uvicorn. POST /chat will work for gpt.qamind.ai

import os

import httpx
from fastapi import Header, HTTPException
from pydantic import BaseModel

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:14b-instruct-q4_K_M")
QAMIND_INTERNAL_KEY = os.getenv("QAMIND_INTERNAL_KEY", "qamind-secret-123")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str | None = None
    messages: list[ChatMessage]


def register_chat_routes(app):
    @app.post("/chat")
    async def chat(
        request: ChatRequest,
        x_qamind_internal_key: str = Header(default=""),
    ):
        if x_qamind_internal_key != QAMIND_INTERNAL_KEY:
            raise HTTPException(status_code=401, detail="Unauthorized")

        model = request.model or OLLAMA_MODEL
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": model,
                    "messages": [m.model_dump() for m in request.messages],
                    "stream": False,
                },
            )
            response.raise_for_status()
            payload = response.json()

        content = (
            (payload.get("message") or {}).get("content")
            or payload.get("response")
            or ""
        )
        return {
            "status": "success",
            "message": {"role": "assistant", "content": content},
            "model": model,
        }
