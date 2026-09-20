from __future__ import annotations
import os

import pytesseract
from PIL import Image

os.environ["TESSDATA_PREFIX"] = r"C:\Users\ACER\TesseractData"

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


class OCRError(Exception):
    pass


class OCRProcessor:

    def scan_image(self, file_path: str) -> str:
        try:
            with Image.open(file_path) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")
                text = pytesseract.image_to_string(img)
        except FileNotFoundError as exc:
            raise OCRError(f"Image not found: {file_path}") from exc
        except Exception as exc:
            raise OCRError(f"OCR failed: {exc}") from exc

        return text or ""