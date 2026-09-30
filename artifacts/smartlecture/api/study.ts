type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OpenAI is not configured yet. Add OPENAI_API_KEY in Vercel Project Settings → Environment Variables, then redeploy." });

  const body = (req.body ?? {}) as { mode?: string; text?: string; image?: string };
  let input: unknown;
  if (body.mode === "ocr") {
    if (!body.image?.startsWith("data:image/")) return res.status(400).json({ error: "Upload a valid image to scan." });
    input = [{ role: "user", content: [
      { type: "input_text", text: "Extract all visible text from this image as accurately as possible. Preserve headings, paragraphs, lists, and equations. Do not invent text. Return only the extracted text." },
      { type: "input_image", image_url: body.image, detail: "high" }
    ] }];
  } else if (body.mode === "summarize") {
    const text = body.text?.trim();
    if (!text) return res.status(400).json({ error: "Add some lecture text first." });
    if (text.length > 60000) return res.status(413).json({ error: "Text is too long. Please send a shorter section." });
    input = "Create clear student study notes from the following lecture material. Include a short overview, key concepts, definitions/formulas, and 5 revision questions. Stay faithful to the provided material and flag unclear points rather than inventing facts.\n\n" + text;
  } else {
    return res.status(400).json({ error: "Unsupported mode. Use ocr or summarize." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.5", input })
    });
    const data = await response.json() as { output_text?: string; error?: { message?: string } };
    if (!response.ok) return res.status(response.status >= 500 ? 502 : response.status).json({ error: data.error?.message || "OpenAI request failed." });
    return res.status(200).json({ text: data.output_text || "" });
  } catch {
    return res.status(502).json({ error: "Could not connect to OpenAI. Please try again." });
  }
}
