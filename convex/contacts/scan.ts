import { action } from "../_generated/server";
import { v } from "convex/values";

type ScannedContact = {
  name: string | null;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
};

const emptyResult = (): ScannedContact => ({
  name: null,
  company: null,
  position: null,
  email: null,
  phone: null,
  website: null,
  address: null,
});

export const scanBusinessCard = action({
  args: {
    imageBase64: v.string(),
    mimeType: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You extract contact information from business card images.
Return ONLY a JSON object with these fields (use null for missing info):
{
  "name": "Full name",
  "company": "Company name",
  "position": "Job title/position",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "address": "Physical address"
}
Return ONLY valid JSON, no markdown, no explanation.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the contact information from this business card:",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${args.mimeType};base64,${args.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    const rawContent = data.choices?.[0]?.message?.content;
    const content =
      typeof rawContent === "string"
        ? rawContent
        : rawContent
            ?.filter((item) => item.type === "text" && typeof item.text === "string")
            .map((item) => item.text)
            .join("")
            .trim();

    if (!content) {
      return {
        ...emptyResult(),
        raw: null,
        error: "No content returned from vision model.",
      };
    }

    try {
      const parsed = JSON.parse(content) as Partial<ScannedContact>;
      return {
        name: parsed.name ?? null,
        company: parsed.company ?? null,
        position: parsed.position ?? null,
        email: parsed.email ?? null,
        phone: parsed.phone ?? null,
        website: parsed.website ?? null,
        address: parsed.address ?? null,
      };
    } catch {
      return {
        ...emptyResult(),
        raw: content,
        error: "Could not parse response.",
      };
    }
  },
});
