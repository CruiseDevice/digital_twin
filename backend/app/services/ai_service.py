import os
import openai
from typing import Dict, Optional
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")


def analyze_email_content(email_content: Dict, pdf_text: Optional[str] = None) -> Dict:
    """
    Generate AI insights based on email content and optional PDF attachment.
    Args:
        email_content: Dict containing email data (subject, body, etc)
        pdf_text: Optional text extracted from PDF attachment

    Returns:
        Dictionary with AI-generated insights
    """
    prompt = f"""
    Analyze the following email:
    
    Subject: {email_content.get('headers', {}).get('Subject', 'No subject')}
    
    From: {email_content.get('headers', {}).get('From', 'Unknown sender')}
    
    Body:
    {email_content.get('body', 'No body content')}
    """
    if pdf_text:
        prompt += f"""
        
        The email contains a PDF attachment with the following content:
        {pdf_text[:3000]}...
        
        Please provide:
        1. A summary of the email and attachment
        2. Key points or action items
        3. Suggested next steps or response
        """
    else:
        prompt += """

        Please provide:
        1. A summary of the email
        2. Key points or action items
        3. Suggested next steps or response
        """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI assistant that helps analyze emails and their attachments."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800
        )

        # extract and process the ai response
        ai_response = response.choices[0].message.content

        # parse the ai response into structured sections
        sections = ai_response.split("\n\n")
        result = {
            "summary": sections[0] if len(sections) > 0 else "",
            "key_points": sections[1] if len(sections) > 1 else "",
            "suggested_response": sections[2] if len(sections) > 2 else "",
            "full_analysis": ai_response,
        }
        return result

    except Exception as e:
        return {
            "error": f"Error generating AI analysis: {str(e)}",
            "summary": "Unable to generate analysis.",
            "key_points": "",
            "suggested_response": "",
        }
    
 
def generate_email_response(email_content: Dict, pdf_text: Optional[str] = None) -> str:
    """
    Generate an email response based on the original email and optional PDF attachment.
    """
    # Format the input for the AI model
    prompt = f"""
    Generate a professional email response to the following email:
    
    Subject: {email_content.get('headers', {}).get('Subject', 'No subject')}
    
    From: {email_content.get('headers', {}).get('From', 'Unknown sender')}
    
    Body:
    {email_content.get('body', 'No body content')}
    """

    if pdf_text:
         prompt += f"""
        
        The email contains a PDF attachment with the following content:
        {pdf_text[:2000]}...
        
        Generate a professional and helpful response that addresses both the email content and the attachment.
        """
    else:
        prompt += """
        
        Generate a professional and helpful response to this email.
        """

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI assistant that helps draft email responses."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating email response: {str(e)}"
