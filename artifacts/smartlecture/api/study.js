export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Gemini is not configured yet. Add GEMINI_API_KEY in Vercel Project Settings → Environment Variables, then redeploy."
    });
  }

  const body = req.body || {};
  let parts;

  if (body.mode === "ocr") {
    if (typeof body.image !== "string" || !body.image.startsWith("data:image/")) {
      return res.status(400).json({ error: "Upload a valid image to scan." });
    }

    const match = body.image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match) {
      return res.status(400).json({ error: "The image data is invalid. Please upload it again." });
    }

    parts = [
      {
        text: "Extract all visible text from this image as accurately as possible. Preserve headings, paragraphs, lists, and equations. Do not invent text. Return only the extracted text."
      },
      {
        inline_data: {
          mime_type: match[1],
          data: match[2]
        }
      }
    ];
  } else if (body.mode === "summarize") {
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ error: "Add some lecture text first." });
    }
    if (text.length > 60000) {
      return res.status(413).json({ error: "Text is too long. Please send a shorter section." });
    }

    parts = [{
      text: "Create clear student study notes from the following lecture material. Include a short overview, key concepts, definitions/formulas, and 5 revision questions. Stay faithful to the provided material and flag unclear points rather than inventing facts.\n\n" + text
    }];
  } else {
    return res.status(400).json({ error: "Unsupported mode. Use ocr or summarize." });
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.2 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: data?.error?.message || "Gemini API request failed."
      });
    }

    const text = (data.candidates?.[0]?.content?.parts || [])
      .map(part => typeof part.text === "string" ? part.text : "")
      .join("\n")
      .trim();

    if (!text) {
      return res.status(502).json({ error: "Gemini returned an empty response. Please try again." });
    }

    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: "Could not connect to Gemini. Please try again." });
  }
}
