"""DOCX to PDF conversion via LibreOffice headless."""

import os
import subprocess
import shutil
import tempfile


def find_libreoffice():
    """Find LibreOffice binary on macOS or Linux."""
    candidates = [
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
        "/usr/bin/soffice",
        "/usr/bin/libreoffice",
        shutil.which("soffice"),
        shutil.which("libreoffice"),
    ]
    for c in candidates:
        if c and os.path.isfile(c):
            return c
    return None


def convert_docx_to_pdf(docx_path: str, pdf_path: str) -> bool:
    """Convert a DOCX file to PDF using LibreOffice headless."""
    soffice = find_libreoffice()
    if not soffice:
        print("LibreOffice not found — skipping PDF conversion")
        return False

    with tempfile.TemporaryDirectory() as tmpdir:
        result = subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf", "--outdir", tmpdir, docx_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode != 0:
            print(f"LibreOffice error: {result.stderr}")
            return False

        basename = os.path.splitext(os.path.basename(docx_path))[0] + ".pdf"
        tmp_pdf = os.path.join(tmpdir, basename)

        if os.path.exists(tmp_pdf):
            os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
            shutil.move(tmp_pdf, pdf_path)
            return True

    return False
