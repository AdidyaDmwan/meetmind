import os
from faster_whisper import WhisperModel
from app.core.config import settings

_model = None

def get_whisper_model() -> WhisperModel:
    global _model
    if _model is None:
        print(f"Loading Whisper model: {settings.WHISPER_MODEL}")
        _model = WhisperModel(
            settings.WHISPER_MODEL,
            device="cpu",
            compute_type="int8"
        )
    return _model

def transcribe_audio(file_path: str) -> str:
    model = get_whisper_model()
    segments, info = model.transcribe(
        file_path,
        beam_size=5,
        vad_filter=True
    )
    print(f"Detected language: {info.language} ({info.language_probability:.2f})")
    transcript = " ".join([segment.text.strip() for segment in segments])
    return transcript.strip()