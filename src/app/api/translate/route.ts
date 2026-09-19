import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const prompt = `Translate this category name from Indonesian to English and Arabic. Return ONLY a valid JSON object in this format: {"en": "English Translation", "ar": "Arabic Translation"}. Do not add any markdown, comments, or extra text. Text to translate: "${text}"`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Fast model for simple translation
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
        throw new Error("Invalid response from Groq API");
    }
    
    const content = data.choices[0].message.content;
    
    // Attempt to parse JSON safely
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let result = { en: text, ar: text };
    
    if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
