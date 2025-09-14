import type { RequestHandler } from "express";

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

export const handleDatasetProxy: RequestHandler = async (req, res) => {
  const urlParam = (req.query.url as string | undefined) ?? DEFAULT_DATASET_URL;
  if (!isAllowedUrl(urlParam)) {
    res.status(400).json({ error: "Invalid dataset URL" });
    return;
  }

  try {
    const response = await fetch(urlParam, {
      method: "GET",
      headers: {
        Accept:
          "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;q=0.9, */*;q=0.1",
      },
    });

    if (!response.ok) {
      res
        .status(response.status)
        .json({ error: `Upstream error ${response.status}` });
      return;
    }

    const arr = new Uint8Array(await response.arrayBuffer());
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(Buffer.from(arr));
  } catch (err) {
    console.error("Dataset proxy error:", err);
    res.status(502).json({ error: "Failed to fetch dataset" });
  }
};
