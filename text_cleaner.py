from __future__ import annotations

import re


class TextCleaner:

    def clean_text(self, raw_text: str) -> str:
        if not raw_text:
            return ""

        text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
        text = re.sub(r"[^\S\n\t]+", " ", text)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = text.replace("“", '"').replace("”", '"')
        text = text.replace("‘", "'").replace("’", "'")
        text = text.replace("—", "-").replace("–", "-")
        text = re.sub(r"(?m)^\s*[^\w\s]{1,2}\s*$", "", text)
        text = "\n".join(line.strip() for line in text.split("\n"))
        return text.strip()