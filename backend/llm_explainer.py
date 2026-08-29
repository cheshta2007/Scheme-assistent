import os
from typing import Dict, Any
from dotenv import load_dotenv

try:
    import anthropic
except ImportError:
    anthropic = None

# Load environment variables from .env
load_dotenv()


def _get_fallback_explanation(scheme_name: str, eligible: bool, failed_on: list) -> str:
    """Generates a fallback explanation from the rule engine result."""
    s_name = str(scheme_name or "the scheme")
    if eligible:
        return f"You are eligible for {s_name} as your profile meets all required criteria."
    else:
        failed_list = [str(x) for x in (failed_on or [])]
        failed_str = ", ".join(failed_list) if failed_list else "unspecified criteria"
        return f"You are currently not eligible for {s_name} because you did not meet the criteria for: {failed_str}."


def explain_result(user_profile: Dict[str, Any], result: Dict[str, Any]) -> str:
    """
    Explains an eligibility result decided by the rule engine.
    Does NOT re-evaluate or override eligibility logic.
    """
    scheme_name = str(result.get("scheme", "the scheme") or "the scheme")
    eligible = bool(result.get("eligible", False))
    failed_on = result.get("failed_on", [])
    if not isinstance(failed_on, list):
        failed_on = []

    try:
        if anthropic is None:
            raise ImportError("anthropic package is not installed in the active Python environment.")

        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key or api_key in ("your-key-here", "your-actual-api-key-here", ""):
            raise ValueError("Anthropic API key is missing or set to placeholder.")

        failed_str = ", ".join([str(x) for x in failed_on]) if failed_on else "None"

        prompt = f"""You are an assistant providing warm, clear explanations for government scheme eligibility results.

User Profile:
- Age: {user_profile.get('age')}
- Income: {user_profile.get('income')}
- State: {user_profile.get('state')}
- Occupation: {user_profile.get('occupation')}
- Category: {user_profile.get('category')}
- Gender: {user_profile.get('gender')}

Scheme Name: {scheme_name}
Eligibility Decision: {'Eligible' if eligible else 'Not Eligible'}
Failed Criteria: {failed_str}

The eligibility decision has already been made by a verified rule engine. Do not change it, question it, or re-evaluate it. Only explain it clearly and warmly in 1-2 short sentences. If eligible, briefly state why they qualify. If not eligible, briefly state which criteria they didn't meet, without being discouraging."""

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=150,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        if response.content and len(response.content) > 0:
            return response.content[0].text.strip()
        return _get_fallback_explanation(scheme_name, eligible, failed_on)

    except Exception:
        return _get_fallback_explanation(scheme_name, eligible, failed_on)

