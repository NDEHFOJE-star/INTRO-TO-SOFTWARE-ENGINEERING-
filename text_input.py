from __future__ import annotations


class TextInputHandler:

    def __init__(self) -> None:
        self._text: str = ""

    def set_text(self, text: str) -> None:
        self._text = text or ""

    def get_text(self) -> str:
        return self._text

    def edit_text(self, new_text: str) -> None:
        self._text = new_text or ""

    def clear_text(self) -> None:
        self._text = ""