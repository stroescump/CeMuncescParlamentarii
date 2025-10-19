# pdf2text.py
import sys
import fitz  # PyMuPDF
import subprocess
from pathlib import Path

p = Path(sys.argv[1])
text_out = Path(sys.argv[2])

def extract_with_pymupdf(path):
    doc = fitz.open(path)
    txt = ""
    for page in doc:
        txt += page.get_text("text")
    return txt

# first try PyMuPDF extraction
txt = extract_with_pymupdf(p)

# if text too short, fallback to OCR
if len(txt.strip()) < 200:
    tmp = p.with_suffix('.ocr.pdf')
    subprocess.check_call(['ocrmypdf', '--force-ocr', str(p), str(tmp)])
    txt = extract_with_pymupdf(tmp)

# write result
text_out.write_text(txt, encoding='utf-8')
print(len(txt))