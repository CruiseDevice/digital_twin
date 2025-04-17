from fastapi import APIRouter, Request, status, HTTPException
from fastapi.responses import RedirectResponse
from app.services.gmail_service import create_flow, credentials_to_dict


router = APIRouter()


@router.get("/login")
async def login(request: Request):
    """Initiate the OAuth login flow."""
    flow = create_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session["state"] = state
    return RedirectResponse(authorization_url)


@router.get("/oauth2callback")
async def oauth2callback(request: Request):
    """Process the OAuth callback."""
    state = request.session.get("state")

    # verufy the state to prevent CSRF
    if not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State parameter missing"
        )
    
    flow = create_flow()
    flow.fetch_token(authorization_response=str(request.url))

    # save credentials in session
    credentials = flow.credentials
    creds_dict = credentials_to_dict(credentials)

    request.session["credentials"] = creds_dict
    
    # redirect to frontend or API homepage
    return RedirectResponse(url="/")


@router.get("/logout")
async def logout(request: Request):
    """Clear the user's session"""
    request.session.clear()
    return {"message": "Logged out successfully"}
