from __future__ import annotations

# Experimental only. The MVP uses Laravel's SpeakingFeedbackService as the
# single source of truth for feedback reports after transcription completes.
# Keep this module around for future microservice extraction experiments, but
# do not call it from worker.py's default processing flow.

FILLER_WORDS = ("um", "uh", "like", "you know", "actually", "basically")


def generate_feedback(transcript: str, metadata: dict[str, object]) -> dict[str, object]:
    normalized = transcript.lower()
    filler_count = sum(normalized.count(word) for word in FILLER_WORDS)
    word_count = len([word for word in transcript.split() if word.strip()])
    duration = metadata.get("duration_seconds") or 0
    words_per_minute = round((word_count / duration) * 60, 1) if isinstance(duration, (int, float)) and duration > 0 else None

    recommendations = [
        "Practice one clear opening sentence before starting the full take.",
        "Pause intentionally between key ideas so your delivery feels controlled.",
    ]

    if filler_count > 0:
        recommendations.append("Replace filler words with short silent pauses.")

    return {
        "summary": "Initial AI feedback placeholder generated from transcript metadata.",
        "confidence_score": 72,
        "pronunciation_score": None,
        "tone": "steady",
        "pace": {
            "words_per_minute": words_per_minute,
            "label": pace_label(words_per_minute),
        },
        "filler_words": {
            "count": filler_count,
            "tracked": list(FILLER_WORDS),
        },
        "recommendations": recommendations,
    }


def pace_label(words_per_minute: float | None) -> str:
    if words_per_minute is None:
        return "unknown"

    if words_per_minute < 110:
        return "slow"

    if words_per_minute > 170:
        return "fast"

    return "balanced"
