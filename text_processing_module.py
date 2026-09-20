from __future__ import annotations

from file_handler import FileUploadHandler, ValidationResult
from ocr_processor import OCRError, OCRProcessor
from reading_engine_interface import ReadingEngineInterface, StubReadingEngine
from text_cleaner import TextCleaner
from text_extractor import TextExtractionError, TextExtractor
from text_input import TextInputHandler


class TextProcessingModule:

    def __init__(self, reading_engine: ReadingEngineInterface | None = None) -> None:
        self.input_handler = TextInputHandler()
        self.upload_handler = FileUploadHandler()
        self.extractor = TextExtractor()
        self.ocr = OCRProcessor()
        self.cleaner = TextCleaner()
        self.reading_engine = reading_engine or StubReadingEngine()

    def process_typed_text(self, text: str) -> str:
        self.input_handler.set_text(text)
        cleaned = self.cleaner.clean_text(self.input_handler.get_text())
        self._send_to_reading_engine(cleaned)
        return cleaned

    def edit_current_text(self, new_text: str) -> str:
        self.input_handler.edit_text(new_text)
        cleaned = self.cleaner.clean_text(self.input_handler.get_text())
        self._send_to_reading_engine(cleaned)
        return cleaned

    def clear_current_text(self) -> None:
        self.input_handler.clear_text()

    def process_uploaded_file(self, file_path: str) -> str:
        validation: ValidationResult = self.upload_handler.validate_file(file_path)
        if not validation.is_valid:
            raise ValueError(f"File rejected: {validation.reason}")

        category = self.upload_handler.classify(validation.extension)

        if category in ("plain_text", "document"):
            raw_text = self.extractor.extract(file_path)
        elif category == "image":
            raw_text = self.ocr.scan_image(file_path)
        else:
            raise ValueError(f"Unhandled file category: {category}")

        cleaned = self.cleaner.clean_text(raw_text)
        self._send_to_reading_engine(cleaned)
        return cleaned

    def _send_to_reading_engine(self, cleaned_text: str) -> None:
        if cleaned_text:
            self.reading_engine.receive_text(cleaned_text)