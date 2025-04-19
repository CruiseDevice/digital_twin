import os
import PyPDF2
from typing import Dict


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file.
    Args:
        file_path (str): The path to the PDF file.
    Returns:
        str: The text content of the PDF file.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    text = ""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n\n"
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

    return text


def summarize_text(file_path: str) -> Dict:
    """
    Extract basic information about a PDF.

    Args:
        file_path (str): The path to the PDF file.
    Returns:
        Dict: Dictionary with PDF information (page count, word count, etc).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() + "\n\n"

            # basic pdf info
            info = {
                "page_count": len(reader.pages),
                "word_count": len(text.split()),
                "char_count": len(text),
                "filename": os.path.basename(file_path),
            }

            # get metadata if available
            if reader.metadata:
                info["title"] = reader.metadata.get("/Title", "")
                info["author"] = reader.metadata.get("/Author", "")
                info["subject"] = reader.metadata.get("/Subject", "")
                info["creation_date"] = reader.metadata.get("/CreationDate", "")

            return info
    except Exception as e:
        pass