import os
import base64
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


# OAuth configuration
CLIENTS_SECRETS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "client_secret.json")
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
REDIRECT_URI = "http://localhost:8000/oauth2callback"


def create_flow():
    """
    Create an OAuth flow instance to manage the OAuth 2.0 Authorization Grant Flow
    """
    flow = Flow.from_client_secrets_file(
        CLIENTS_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    return flow


def credentials_to_dict(credentials):
    """
    Convert credentials to a dictionary.
    """
    return {
        "token": credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }


def build_service(credentials_dict):
    """Build a Gmail service from credentials dictionary."""
    
    required_fields = ['refresh_token', 'token_uri', 'client_id', 'client_secret']
    missing_fields = [field for field in required_fields if not credentials_dict.get(field)]
    
    if missing_fields:
        raise ValueError(f"Missing required credentials fields: {', '.join(missing_fields)}")
    
    credentials = Credentials.from_authorized_user_info(credentials_dict)
    return build('gmail', 'v1', credentials=credentials)


def list_messages(service, query='', max_results=10):
    """
    List messages matching the query.
    """
    results = service.users().messages().list(
        userId='me', q=query, maxResults=max_results
    ).execute()
    return results.get('messages', [])


def get_message(service, message_id):
    """
    Get a message by its id
    """
    message = service.users().messages().get(userId='me', id=message_id).execute()

    # extract headers
    headers = {}
    for header in message['payload']['headers']:
        headers[header['name']] = header['value']
    
    # Process parts recursively to extract body and attachments
    parts = [message['payload']]
    html_body = None
    plain_body = None
    attachments = []

    while parts:
        part = parts.pop(0)
        # if the part has subparts, add them to out processing queue
        if 'parts' in part:
            parts.extend(part['parts'])
            continue
    
        # process this part based on its MIME type
        mime_type = part.get('mimeType', '')

        if mime_type == 'text/html' and 'data' in part.get('body', {}):
            body_data = part['body']['data']
            decoded_bytes = base64.urlsafe_b64decode(body_data)
            html_body = decoded_bytes.decode('utf-8')
        elif mime_type == 'text/plain' and 'data' in part.get('body', {}) and not html_body:
            body_data = part['body']['data']
            decoded_bytes = base64.urlsafe_b64decode(body_data)
            plain_body = decoded_bytes.decode('utf-8')

        # handle attachments
        elif 'attachmentId' in part.get('body', {}):
            attachments.append({
                'id': part['body']['attachmentId'],
                'filename': part.get('filename', ''),
                'mimeType': mime_type
            })

    # Use HTML body if available, otherwise use plain text
    body = html_body if html_body else plain_body

    return {
        'id': message_id,
        'headers': headers,
        'body': body,
        'attachments': attachments
    }
    

def get_attachment(service, message_id, attachment_id):
    """Get an attachment by its ID"""
    attachment = service.users().messages().attachments().get(
        userId='me', messageId=message_id, id=attachment_id
    ).execute()

    data = attachment['data']
    file_data = base64.urlsafe_b64decode(data)
    return file_data


def list_threads(service, query='', max_results=10):
    """
    List email threads matching the query.
    """
    results = service.users().threads().list(
        userId='me', q=query, maxResults=max_results
    ).execute()
    return results.get('threads', [])


def get_thread(service, thread_id):
    """
    Get all messages in a thread by thread_id
    """
    try:
        thread = service.users().threads().get(
            userId='me', id=thread_id
        ).execute()
        
        messages = []
        for message in thread['messages']:
            # extract headers
            headers = {}
            for header in message['payload']['headers']:
                headers[header['name']] = header['value']

            # process parts recursively to extract body and attachments
            parts = [message['payload']]
            html_body = None
            plain_body = None
            attachments = []
            
            while parts:
                part = parts.pop(0)
                # if the part has subparts add them to our processing queue
                if 'parts' in part:
                    parts.extend(part['parts'])
                    continue

                # process this part based on its MIME type
                mime_type = part.get('mimeType', '')

                if mime_type == 'text/html' and 'data' in part.get('body', {}):
                    body_data = part['body']['data']
                    decoded_bytes = base64.urlsafe_b64decode(body_data)
                    html_body = decoded_bytes.decode('utf-8')
                elif mime_type == 'text/plain' and 'data' in part.get('body', {}) and not html_body:
                    body_data = part['body']['data']
                    decoded_bytes = base64.urlsafe_b64decode(body_data)
                    plain_body = decoded_bytes.decode('utf-8')

                # handle attachments
                elif 'attachmentId' in part.get('body', {}):
                    attachments.append({
                        'id': part['body']['attachmentId'],
                        'filename': part.get('filename', ''),
                        'mimeType': mime_type,
                        'messageId': message['id']  # store the message id for attachment retrieval
                    })
            
            # use html body if available, otherwise use plain text
            body = html_body if html_body else plain_body

            messages.append({
                'id': message['id'],
                'threadId': thread_id,
                'headers': headers,
                'body': body,
                'attachments': attachments,
                'internalDate': message.get('internalDate')  # for sorting
            })

        # sort messages by internalDate
        messages.sort(key=lambda x: int(x.get('internalDate', 0)))
        return {
            'id': thread_id,
            'messages': messages,
            'historyId': thread.get('historyId'),
            'snippet': thread.get('snippet')
        }
    except Exception as e:
        raise Exception(f"Error fetching thread {thread_id}: {e}")