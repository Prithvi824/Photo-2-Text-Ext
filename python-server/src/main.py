"""
This module contains the main FastAPI app and the endpoint for converting an image to text.

Author:
    Prithvi Srivastava (github): https://github.com/Prithvi824 
"""

import logging
from typing import Union
from http import HTTPStatus
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.models import ConvertImgReq
from src.config import LOG_FILE, CORS_SETTINGS
from src.ocr_detector.ocr import OcrDetector

# setup logger
logging.basicConfig(
    level=logging.INFO,
    datefmt="%H:%M:%S",
    format="%(asctime)s - %(name)s: %(lineno)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler()],
)

logger = logging.getLogger(__name__)

# create the FastAPI app and add the CORS middleware
app = FastAPI()
app.add_middleware(CORSMiddleware, *CORS_SETTINGS)

# create an instance of the OcrDetector class
ocr_detector = OcrDetector()


@app.post("/convert")
def convert_image_to_text(req_body: ConvertImgReq) -> Union[dict, tuple]:
    """
    Converts an image to text using OCR.

    Args:
        req_body (ConvertImgReq): The request_body as a ConvertImgReq model.

    Returns:
        Union[dict, tuple]: A dictionary containing the extracted text and an HTTP status code 200 if successful,
        or a tuple containing an error message and an HTTP status code 400 if unsuccessful.
    """

    try:
        # clean the data
        req_body.img = req_body.img.replace("data:image/png;base64,", "")

        # get the extracted text
        res_text = ocr_detector.extract_text_base64(req_body.img)

        logger.info("Text extracted successfully.")
        return JSONResponse({"text": res_text}, status_code=HTTPStatus.OK)

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return JSONResponse(
            {"error": "An error occurred while extracting text.", "message": str(e)},
            status_code=HTTPStatus.BAD_REQUEST,
        )
