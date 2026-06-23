# Copy to: C:\Users\Admin\OneDrive\Attachments\Desktop\QAMindWorker\chat_endpoint.py
#
# In main.py (at the very bottom, after all other routes):
#
#   from chat_endpoint import register_chat_routes
#   register_chat_routes(app)

import os

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:14b-instruct-q4_K_M")
QAMIND_INTERNAL_KEY = os.getenv("QAMIND_INTERNAL_KEY", "qamind-secret-123")

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str | None = None
    messages: list[ChatMessage]


@router.post("/chat")
def chat_endpoint(
    request: ChatRequest,
    x_qamind_internal_key: str = Header(default=""),
):
    if x_qamind_internal_key != QAMIND_INTERNAL_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    model = request.model or OLLAMA_MODEL

    with httpx.Client(timeout=300.0) as client:
        response = client.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": model,
                "messages": [m.model_dump() for m in request.messages],
                "stream": False,
            },
        )
        response.raise_for_status()
        payload = response.json()

    message = payload.get("message") or {}
    content = message.get("content") or payload.get("response") or ""

    return {
        "status": "success",
        "message": {"role": "assistant", "content": content},
        "model": model,
    }


def register_chat_routes(app):
    app.include_router(router)
