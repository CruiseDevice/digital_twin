from fastapi import APIRouter, Request, HTTPException, Depends, status
from app.services.gmail_service import build_service, list_messages, get_message
import os

router = APIRouter()


async def get_gmail_service(request: Request):
    """
    Get an authenticated Gmail service or raise an error.
    """
    if "credentials" not in request.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return build_service(request.session["credentials"])


@router.get("/emails")
async def list_emails(
    request: Request,
    service=Depends(get_gmail_service),
    query: str="has:attachment filename:pdf",
    max_results: int=10
):
    """List emails matching the query."""
    try:
        messages = list_messages(service, query, max_results)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/emails/{email_id}")
async def get_email(
    request: Request,
    email_id: str,
    service=Depends(get_gmail_service)
):
    """Get a specific email by ID."""
    try:
        email_data = get_message(service, email_id)
        return email_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))