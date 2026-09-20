from __future__ import annotations

import os


class TextExtractionError(Exception):
    pass


class TextExtractor:

    def extract(self, file_path: str) -> str:
        extension = os.path.splitext(file_path)[1].lower()

        if extension in {".txt", ".md", ".csv"}:
            return self._extract_plain_text(file_path)
        if extension == ".pdf":
            return self._extract_pdf(file_path)
        if extension == ".docx":
            return self._extract_docx(file_path)

        raise TextExtractionError(f"Unsupported extension: {extension}")

    def _extract_plain_text(self, file_path: str) -> str:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except OSError as exc:
            raise TextExtractionError(f"Could not read file: {exc}") from exc

    def _extract_pdf(self, file_path: str) -> str:
        try:
            import PyPDF2
        except ImportError as exc:
            raise TextExtractionError(
                "PyPDF2 is not installed. Run: pip install pypdf"
            ) from exc

        text_parts: list[str] = []
        try:
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    text_parts.append(page_text)
        except Exception as exc:
            raise TextExtractionError(f"PDF extraction failed: {exc}") from exc

        return "\n".join(text_parts)

    def _extract_docx(self, file_path: str) -> str:
        try:
            import docx
        except ImportError as exc:
            raise TextExtractionError(
                "python-docx is not installed. Run: pip install python-docx"
            ) from exc

        try:
            document = docx.Document(file_path)
            return "\n".join(p.text for p in document.paragraphs)
        except Exception as exc:
            raise TextExtractionError(f"DOCX extraction failed: {exc}") from exc