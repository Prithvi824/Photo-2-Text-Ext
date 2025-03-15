"""
Module to store configuration variables for the application.
"""

import os
import pytesseract

# path to the tesseract executable
TESSERACT_EXE_PATH = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE_PATH

# create the log folder
BASE_DIR = os.path.dirname(__file__)
LOG_FOLDER = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_FOLDER, exist_ok=True)

# path to the log file
LOG_FILE = os.path.join(LOG_FOLDER, "app.log")

# CORS settings
CORS_SETTINGS = {
    "allow_origins": ["*"],
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
