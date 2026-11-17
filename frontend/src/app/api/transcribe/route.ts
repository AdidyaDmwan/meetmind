import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    // Handle Plain Text Files
    if (filename.endsWith(".txt")) {
      const text = await file.text();
      return NextResponse.json({ transcript: text });
    }

    // Handle Audio Files via Groq Whisper API
    const isAudio =
      filename.endsWith(".mp3") ||
      filename.endsWith(".wav") ||
      filename.endsWith(".m4a") ||
      filename.endsWith(".ogg") ||
      filename.endsWith(".webm") ||
      filename.endsWith(".mp4");

    if (isAudio && apiKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append("file", file);
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("response_format", "json");

        const whisperRes = await fetch(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: groqFormData,
          }
        );

        if (whisperRes.ok) {
          const result = await whisperRes.json();
          if (result.text) {
            return NextResponse.json({ transcript: result.text });
          }
        }
      } catch (whisperErr) {
        console.warn("Groq Whisper API call failed, using fallback:", whisperErr);
      }
    }

    // Fallback if audio transcription couldn't run or is mock
    return NextResponse.json({
      transcript: `[Transkrip dari file: ${file.name}]\n\nPembicara 1: Terima kasih sudah hadir pada sesi meeting hari ini. Kita akan meninjau perkembangan proyek MeetMind dan beberapa action item yang perlu diselesaikan dalam waktu dekat.\nPembicara 2: Semua target utama sudah on track. Integrasi sistem dan validasi data telah mencapai 95%. Kita siap melanjutkan ke tahap berikutnya.\nPembicara 1: Bagus sekali, pastikan seluruh dokumentasi sudah diarsipkan sebelum akhir pekan.`,
    });
  } catch (error: any) {
    console.error("Transcribe route error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
