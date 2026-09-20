from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class ValidationResult:
    is_valid: bool
    reason: str = ""
    extension: str = ""


class FileUploadHandler:

    PLAIN_TEXT_EXTENSIONS = {".txt", ".md", ".csv"}
    DOCUMENT_EXTENSIONS = {".pdf", ".docx"}
    IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".gif"}

    MAX_FILE_SIZE = 10 * 1024 * 1024

    def validate_file(self, file_path: str) -> ValidationResult:
        if not file_path:
            return ValidationResult(False, "No file path provided.")

        if not os.path.exists(file_path):
            return ValidationResult(False, "File does not exist.")

        if not os.path.isfile(file_path):
            return ValidationResult(False, "Path is not a file.")

        extension = os.path.splitext(file_path)[1].lower()

        allowed = (
            self.PLAIN_TEXT_EXTENSIONS
            | self.DOCUMENT_EXTENSIONS
            | self.IMAGE_EXTENSIONS
        )
        if extension not in allowed:
            return ValidationResult(
                False,
                f"Unsupported file type '{extension}'. "
                f"Allowed: {', '.join(sorted(allowed))}",
            )

        try:
            size = os.path.getsize(file_path)
        except OSError as exc:
            return ValidationResult(False, f"Cannot read file size: {exc}")

        if size > self.MAX_FILE_SIZE:
            return ValidationResult(
                False,
                f"File too large ({size} bytes). Max is {self.MAX_FILE_SIZE} bytes.",
            )

        return ValidationResult(True, "File is valid.", extension)

    def classify(self, extension: str) -> str:
        extension = extension.lower()
        if extension in self.PLAIN_TEXT_EXTENSIONS:
            return "plain_text"
        if extension in self.DOCUMENT_EXTENSIONS:
            return "document"
        if extension in self.IMAGE_EXTENSIONS:
            return "image"
        return "unknown"