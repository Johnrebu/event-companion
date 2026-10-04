const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...extra, "Content-Type": "application/json" },
  });

const PROMPT = `You read photos or scans of bills, receipts and invoices for an Indian event expense report.
Extract:
- vendor: the shop/company name that issued the bill
- date: bill date in YYYY-MM-DD format
- total: the final amount payable (grand total including taxes) as a plain number, no currency symbols
- description: a short 2-6 word label for what was bought (e.g. "Stage decoration", "Catering lunch")
Use null for anything you cannot read. If the image is not a bill, return all nulls.
Reply with ONLY a JSON object: {"vendor": string|null, "date": string|null, "total": number|null, "description": string|null}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured for this app." }, 500);

  let image: string;
  try {
    const body = await req.json();
    image = String(body?.image ?? "");
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (!image.startsWith("data:image/")) return json({ error: "Please upload an image file (JPG, PNG, WEBP)." }, 400);
  if (image.length > 8_000_000) return json({ error: "Image is too large. Please use one under 5 MB." }, 400);

  const runIdIn = req.headers.get("X-Lovable-AIG-Run-ID")?.trim();
  let upstream: Response;
  try {
    upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
        ...(runIdIn ? { "X-Lovable-AIG-Run-ID": runIdIn } : {}),
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: PROMPT },
              { type: "input_image", image_url: image },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: corsHeaders });
    console.error(error);
    return json({ error: "Could not reach the AI service. Please try again." }, 502);
  }

  const runId = upstream.headers.get("X-Lovable-AIG-Run-ID");
  const extra: Record<string, string> = runId ? { "X-Lovable-AIG-Run-ID": runId } : {};

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("gateway error", upstream.status, text);
    let message = "AI could not read this bill.";
    try {
      message = JSON.parse(text)?.error?.message ?? JSON.parse(text)?.message ?? message;
    } catch { /* keep default */ }
    if (upstream.status === 429) message = "Too many requests right now. Please wait a moment and try again.";
    if (upstream.status === 402) message = "AI credits are used up for this workspace. " + message;
    return json({ error: message }, upstream.status, extra);
  }

  // Read the SSE stream and collect the final text.
  let text = "";
  let streamError: string | null = null;
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const evt = JSON.parse(data);
        if (evt.type === "response.output_text.delta") text += evt.delta ?? "";
        else if (evt.type === "error" || evt.type === "response.failed")
          streamError = evt.error?.message ?? evt.response?.error?.message ?? "AI request failed";
      } catch { /* ignore partial */ }
    }
  }

  if (streamError) return json({ error: streamError }, 502, extra);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return json({ error: "AI returned no result for this image." }, 502, extra);

  try {
    const raw = JSON.parse(match[0]);
    const total = raw.total == null ? null : Number(String(raw.total).replace(/[^0-9.]/g, ""));
    return json(
      {
        vendor: typeof raw.vendor === "string" ? raw.vendor.trim() : null,
        date: typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null,
        total: total != null && Number.isFinite(total) ? total : null,
        description: typeof raw.description === "string" ? raw.description.trim() : null,
      },
      200,
      extra,
    );
  } catch {
    return json({ error: "AI result could not be understood. Please try a clearer photo." }, 502, extra);
  }
});
