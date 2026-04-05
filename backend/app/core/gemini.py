from groq import Groq
from app.core.config import settings
import json

client = Groq(api_key=settings.GEMINI_API_KEY)

def analyze_meeting(transcript: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Kamu adalah asisten yang menganalisis transkrip meeting. Balas HANYA dengan JSON valid, tanpa teks tambahan apapun."
            },
            {
                "role": "user",
                "content": f"""
Analisis transkrip berikut dan kembalikan JSON dengan format ini:
{{
  "summary": "Ringkasan singkat meeting dalam 3-5 kalimat",
  "action_items": [
    {{
      "description": "Deskripsi tugas",
      "assignee": "Nama orang atau null",
      "due_date": "YYYY-MM-DD atau null"
    }}
  ],
  "key_decisions": [
    {{
      "description": "Keputusan penting yang diambil"
    }}
  ]
}}

Transkrip:
{transcript}
"""
            }
        ],
        temperature=0.3
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = "\n".join(text.split("\n")[1:-1])
    return json.loads(text)