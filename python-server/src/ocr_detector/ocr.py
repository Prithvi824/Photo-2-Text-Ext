"""
Module for detecting and extracting text from images using OCR (Optical Character Recognition).
"""

import cv2
import base64
import logging
import numpy as np
import pytesseract
from typing import Optional

logger = logging.getLogger(__name__)


class OcrDetector:
    """
    A class used to detect and extract text from images using OCR (Optical Character Recognition).

    Methods
    -------

    preprocess_img(image: cv2.typing.MatLike) -> cv2.typing.MatLike
        Converts the input image to grayscale, applies bitwise not and thresholding, and returns the preprocessed image.

    load_image(path: str) -> cv2.typing.MatLike
        Loads an image from the specified file path, preprocesses it, and returns the preprocessed image.

    extract_text(image: cv2.typing.MatLike) -> str
        Extracts and returns text from the preprocessed image using Tesseract OCR.
    """

    def preprocess_img(self, image: cv2.typing.MatLike) -> cv2.typing.MatLike:
        """
        Preprocess the input image for OCR detection.

        Args:
            image (cv2.typing.MatLike): The input image to preprocess.

        Returns:
            cv2.typing.MatLike: The preprocessed image ready for OCR detection.
        """

        # convert the image to gray scale
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # apply bitwise not and threshold
        img_bit_not = cv2.bitwise_not(gray_image)
        _, thresh_img = cv2.threshold(img_bit_not, 200, 255, cv2.THRESH_OTSU)

        logger.info("Image preprocessed successfully.")
        return thresh_img

    def load_image_path(self, path: str) -> cv2.typing.MatLike:
        """
        Load an image from the specified file path and preprocess it.

        Args:
            path (str): The file path to the image.

        Returns:
            cv2.typing.MatLike: The preprocessed image.

        Raises:
            cv2.error: If the image cannot be loaded.
        """

        # load the img and preprocess it
        image = cv2.imread(path)

        logger.info(f"Image loaded from path {path}")
        return self.preprocess_img(image)

    def extract_text(self, image: cv2.typing.MatLike) -> str:
        """
        Extracts text from the given image using OCR (Optical Character Recognition).

        Args:
            image (cv2.typing.MatLike): The image from which to extract text.

        Returns:
            str: The text extracted from the image.
        """

        # Extract text from the image
        extracted_string: Optional[str] = pytesseract.image_to_string(image)

        if extracted_string:
            extracted_string = extracted_string.strip()

        logger.info("Text extracted from image: %s", extracted_string)
        return extracted_string

    def extract_text_base64(self, image: str) -> str:
        """
        Extracts text from the given base64 encoded image using OCR.

        Args:
            image (bytes): The base64 encoded image from which to extract text.

        Returns:
            str: The text extracted from the image.
        """

        # fix padding issues
        missing_padding = len(image) % 4
        if missing_padding:
            image += "=" * (4 - missing_padding)

        # decode the base64 image
        image = base64.b64decode(image)

        # convert the image to a numpy array
        image = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)

        # preprocess the image
        processed_image = self.preprocess_img(image)

        # extract text from the image
        return self.extract_text(processed_image)
