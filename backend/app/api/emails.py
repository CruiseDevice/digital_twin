from fastapi import APIRouter, Request, HTTPException, Depends, status
from app.services.gmail_service import build_service, get_thread, list_messages, \
    get_message, get_attachment, list_threads
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

        # get basic details for each message
        detailed_messages = []
        for message in messages:
            message_detail = service.users().messages().get(
                userId='me', id=message['id'], format='metadata'
            ).execute()

            # Extract subject and sender
            headers = {}
            for header in message_detail.get('payload', {}).get('headers', []):
                if header['name'].lower() in ['subject', 'from', 'date']:
                    headers[header['name'].lower()] = header['value']
            
            detailed_messages.append({
                'id': message['id'],
                'threadId': message['threadId'],
                'subject': headers.get('subject', '(No subject)'),
                'from': headers.get('from', ''),
                'date': headers.get('date', '')
            })
        return {"messages": detailed_messages}
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
    

@router.get("/emails/{email_id}/attachments/{attachments_id}")
async def download_attachment(
    email_id: str,
    attachment_id: str,
    request: Request,
    service=Depends(get_gmail_service)
):
    """Download an attachment"""
    try:
        attachment_data = get_attachment(service, email_id, attachment_id)

        # get email to find filename
        email_data = get_message(service, email_id)
        attachment_info = next(
            (a for a in email_data["attachments"] if a["id"] == attachment_id),
            {'filename': 'attachmebt.bin'}
        )

        # create attachments dir if it does not exist
        os.makedirs("attachments", exist_ok=True)

        file_path = f"attachments/{attachment_info['filename']}"
        with open(file_path, "wb") as f:
            f.write(attachment_data)

        return {"message": "Attachment download", "path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/threads")
async def list_email_threads(
    request: Request,
    service=Depends(get_gmail_service),
    query: str="has:attachment filename:pdf",
    max_results: int=10
):
    """
    List email threads matching the query.
    """
    try:
        threads = list_threads(service, query, max_results)
        
        # get basic details for each thread
        thread_previews = []
        for thread in threads:
            thread_detail = service.users().threads().get(
                userId='me', id=thread['id'], format='metadata'
            ).execute()

            # use the most recent message in the thread for preview
            if thread_detail.get('messages'):
                latest_message = thread_detail['messages'][-1]

                # extract subject and sender
                headers = {}
                for header in latest_message.get('payload', {}).get('headers', []):
                    if header['name'].lower() in ['subject', 'from', 'date']:
                        headers[header['name'].lower()] = header['value']
                
                thread_previews.append({
                    'id': thread['id'],
                    'subject': headers.get('subject', '(No subject)'),
                    'from': headers.get('from', ''),
                    'date': headers.get('date', ''),
                    'snippet': thread.get('snippet', ''),
                    'messageCount': len(thread_detail.get('messages', []))
                })
        return {"threads": thread_previews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/threads/{thread_id}")
async def get_email_thread(
    request: Request,
    thread_id: str,
    service=Depends(get_gmail_service)
):
    """
    Get a complete email thread by ID.
    """
    try:
        thread_data = get_thread(service, thread_id)
        return thread_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))