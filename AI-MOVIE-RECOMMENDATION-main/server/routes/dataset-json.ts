import type { RequestHandler } from "express";
import XLSX from "xlsx";

const DEFAULT_DATASET_URL =
  "https://cdn.builder.io/o/assets%2F71c7b6b864574b1b8961350c142edc8e%2Ffadf24aeff3f429dbc2f0fae63067fab?alt=media&token=8cc13d24-7ba2-44b9-8500-b47dae542e76&apiKey=71c7b6b864574b1b8961350c142edc8e";

function isAllowedUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    return (
      (u.hostname.endsWith("builder.io") ||
        u.hostname.endsWith("cdn.builder.io")) &&
      u.pathname.includes("/assets")
    );
  } catch {
    return false;
  }
}

export const handleDatasetJson: RequestHandler = async (req, res) => {
  const urlParam = (req.query.url as string | undefined) ?? DEFAULT_DATASET_URL;
  if (!isAllowedUrl(urlParam)) {
    res.status(400).json({ error: "Invalid dataset URL" });
    return;
  }

  try {
    // Try remote fetch first
    const response = await fetch(urlParam);
    if (!response.ok) {
      throw new Error(`Upstream error ${response.status}`);
    }
    const ab = await response.arrayBuffer();
    const rows = parseToRows(ab);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({ rows });
  } catch (remoteErr) {
    try {
      // Fallback to local copy in public/
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const ab = await fs
        .readFile(path.resolve(process.cwd(), "public/dataset.xlsx"))
        .then((b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
      const rows = parseToRows(ab);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.json({ rows, source: "local" });
    } catch (localErr) {
      console.error("Dataset JSON route failed", remoteErr, localErr);
      res.status(502).json({ error: "Failed to parse dataset" });
    }
  }
};

function parseToRows(ab: ArrayBuffer): any[] {
  // If it's clearly HTML/text, avoid binary read
  const head = new Uint8Array(ab.slice(0, 16));
  const isHTML = head[0] === 0x3c; /* < */
  if (isHTML) {
    const txt = new TextDecoder("utf-8").decode(new Uint8Array(ab));
    if (!txt.trim() || txt.trim().startsWith("<")) {
      throw new Error("Received HTML/error page instead of dataset");
    }
    const wb = XLSX.read(txt, { type: "string" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  // Try XLSX/ZIP path using Buffer (Node)
  const buf = Buffer.from(ab);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}
