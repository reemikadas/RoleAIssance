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
      const lines: string[] = [];
      let currentLine: string[] = [];
      let currentY: number | null = null;
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = item.transform[5];
        if (currentY !== null && Math.abs(y - currentY) > 2) {
          lines.push(currentLine.join(" ").trim());
          currentLine = [];
        }
        currentY = y;
        currentLine.push(item.str.trim());
      }
      if (currentLine.length) lines.push(currentLine.join(" ").trim());
      pages.push(lines.join("\n"));
    }
    return pages.join("\n").trim();
  }

  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: file.buffer });
  return result.value.trim();
}
