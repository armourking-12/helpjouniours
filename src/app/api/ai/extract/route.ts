import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // Allow 60 seconds for AI processing

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileBase64, mimeType } = body;

    if (!fileBase64 || !mimeType) {
      return NextResponse.json(
        { error: "File data and mimeType are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert academic document parser.
      Analyze this academic document (could be an exam paper, assignment, or study notes).
      Extract the following information and return it strictly as a JSON object.
      Do not include any markdown formatting (like \`\`\`json), just return the raw JSON object.

      If a piece of information is not present or cannot be determined confidently, leave it as an empty string "" (or null for numbers).
      For "tags", provide a comma-separated string of 3-5 relevant keywords.

      Expected JSON Structure:
      {
        "university": "string",
        "course": "string",
        "semester": number | null,
        "subject": "string",
        "year": number | null,
        "examType": "string (MUST be exactly one of: 'Mid-Term', 'End-Term', 'Supplementary', 'Internal', 'Practical', 'Viva', 'Debarred', 'Back' or empty string)",
        "title": "string (create a short, descriptive title if none exists)",
        "description": "string (a brief 1-2 sentence description of the content)",
        "tags": "string (comma separated)"
      }
    `;

    // Support both images and PDFs through inlineData
    const documentPart = {
      inlineData: {
        data: fileBase64.replace(/^data:(image|application)\/\w+;base64,/, ""),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, documentPart]);
    const responseText = result.response.text();

    const cleanJsonString = responseText
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    const extractedData = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error) {
    console.error("Gemini AI Extraction Error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from document. Please try again or enter manually." },
      { status: 500 }
    );
  }
}
