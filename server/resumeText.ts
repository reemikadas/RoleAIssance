export async function extractResumeText(file: Express.Multer.File) {
  if (file.mimetype === "application/pdf") {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const document = await getDocument({
      data: new Uint8Array(file.buffer),
      useSystemFonts: true,
    }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );
    }
    return pages.join("\n").trim();
  }

  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: file.buffer });
  return result.value.trim();
}
