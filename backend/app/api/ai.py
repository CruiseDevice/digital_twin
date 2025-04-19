import tempfile
import os
from fastapi import Request, Depends, APIRouter, HTTPException
from app.services.pdf_service import extract_text_from_pdf, summarize_text
from app.services.gmail_service import get_message, get_attachment
from app.services.ai_service import analyze_email_content, generate_email_response
from app.api.emails import get_gmail_service


router = APIRouter()


@router.get("/analyze/{email_id}")
async def analyze_email(
    email_id: str,
    request: Request,
    service=Depends(get_gmail_service),
    include_attachments: bool = True,
):
    """Analyze an email and its attachments using AI"""
    try:
        # get the email
        email_data = get_message(service, email_id)
        
        # process attachments if requested and available
        if include_attachments and email_data.get("attachments"):
            for attachment in email_data["attachments"]:
                # check if attachment is a PDF
                if attachment["mimeType"] == "application/pdf":
                    # Download the attachment
                    attachment_data = get_attachment(service, email_id, attachment["id"])

                    # create a temporary file to store the PDF
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                        temp_file.write(attachment_data)
                        temp_path = temp_file.name

                    try:
                        # Extract text from the PDF
                        pdf_text = extract_text_from_pdf(temp_path)
                        pdf_summary = summarize_text(temp_path)
                    except Exception as e:
                        return {
                            "error": f"Error processing PDF: {str(e)}",
                            "email_analysis": analyze_email_content(email_data)
                        }
                    finally:
                        # clean up the temporary file
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                    
                    # we only process the first pdf attachment for now
                    break

        # generate ai analysis
        analysis = analyze_email_content(email_data, pdf_text)
        return {
            "email_analysis": analysis,
            "pdf_summary": pdf_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/generate-response/{email_id}")
async def generate_response(
    email_id: str,
    request: Request,
    include_attachments: bool = True,
    service=Depends(get_gmail_service)
):
    """
    Generate an email response using AI
    """
    try:
        email_data = get_message(service, email_id)
        
        # process attachments if requested and available
        if include_attachments and email_data.get("attachments"):
            for attachment in email_data["attachments"]:
                # check if attachment is a PDF
                if attachment["mimeType"] == "application/pdf":
                    # download the attachment
                    attachment_data = get_attachment(service, email_id, attachment["id"])

                    # create a temporary file to store the PDF
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                        temp_file.write(attachment_data)
                        temp_path = temp_file.name

                    try:
                        # Extract text from the pdf
                        pdf_text = extract_text_from_pdf(temp_path)
                    except Exception as e:
                        return {
                            "error": f"Error processing PDF: {str(e)}",
                            "response": generate_email_response(email_data)
                        }
                    finally:
                        # clean up the temporary file
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                # we only process the first pdf attachment for now
                break
    
        # generate ai response
        response = generate_email_response(email_data, pdf_text)
        return {
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))