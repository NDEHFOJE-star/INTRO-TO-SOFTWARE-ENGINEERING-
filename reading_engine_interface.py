from __future__ import annotations

from abc import ABC, abstractmethod


class ReadingEngineInterface(ABC):

    @abstractmethod
    def receive_text(self, text: str) -> None:
        ...


class StubReadingEngine(ReadingEngineInterface):

    def __init__(self) -> None:
        self.last_received: str = ""

    def receive_text(self, text: str) -> None:
        self.last_received = text
        print("\n--- [STUB Reading Engine] Received text ---")
        print(text)
        print("-------------------------------------------\n")