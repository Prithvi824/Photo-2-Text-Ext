"""
Module to test the OCR functionality of the application.
"""

import cv2
import json
import pytesseract
from typing import Optional
from src.config import TESSERACT_EXE_PATH
from src.ocr_detector.ocr import OcrDetector


# Set the path to the Tesseract executable
pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE_PATH


class TestOcr:
    """
    Class to test the OCR functionality of the application.
    """

    def write_to_json(self, expected_string: str, image_path: str, output_path: str) -> None:
        """
        Write the expected string and the image path to a JSON file.
        """

        with open(output_path, "w") as file:
            json.dump({"text": expected_string, "image": image_path}, file)

    def common_text_extraction(self, image_path: str) -> Optional[str]:
        """
        Extracts text from an image file using OCR (Optical Character Recognition).

        Args:
            image_path (str): The file path to the image from which text is to be extracted.

        Returns:
            Optional[str]: The extracted text from the image, or None if extraction fails.
        """

        # Read the image
        image = cv2.imread(image_path)

        # Extract text from the image
        extracted_string = OcrDetector().extract_text(image)

        return extracted_string

    def test_wiki_start(self):
        """
        Test the OCR functionality by comparing the extracted text from an image
        with the expected text stored in a JSON file.

        Raises:
            AssertionError: If the extracted text does not match the expected text.
        """

        # Load the expected data
        json_path = "tests/expected_outputs/wiki_start.json"
        with open(json_path, "r") as file:
            json_data = json.load(file)

        # Extract the text from the image
        image_path = json_data["image"]
        expected_string = json_data["text"]
        extracted_string = self.common_text_extraction(image_path)

        # compare
        assert extracted_string == expected_string

    
    def test_wiki_para(self):
        """
        Test the OCR functionality by comparing the extracted text from an image
        with the expected text stored in a JSON file.

        Raises:
            AssertionError: If the extracted text does not match the expected text.
        """

        # Load the expected data
        json_path = "tests/expected_outputs/wiki_para.json"
        with open(json_path, "r") as file:
            json_data = json.load(file)

        # Extract the text from the image
        image_path = json_data["image"]
        expected_string = json_data["text"]
        extracted_string = self.common_text_extraction(image_path)

        # compare
        assert extracted_string == expected_string
