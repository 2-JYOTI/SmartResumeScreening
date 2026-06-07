import re

def clean_text(text):
    text = (text or "").lower()
    text = text.replace("&", " and ")
    text = re.sub(r'[^a-z0-9+#.\s-]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
