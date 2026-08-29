import json
from typing import List, Dict, Any, Union
from models import UserProfile


import os


def load_schemes(path: str = "schemes.json") -> List[Dict[str, Any]]:
    """Loads schemes from a JSON file. Fallback to scheme.json / schemes.json, picking the most recently modified file if both exist."""
    target_path = path
    dir_name = os.path.dirname(target_path)
    base_name = os.path.basename(target_path)

    # Check both schemes.json and scheme.json variants
    p_schemes = os.path.join(dir_name, "schemes.json") if dir_name else "schemes.json"
    p_scheme = os.path.join(dir_name, "scheme.json") if dir_name else "scheme.json"

    candidates = []
    if os.path.exists(target_path):
        candidates.append(target_path)
    if os.path.exists(p_schemes) and p_schemes not in candidates:
        candidates.append(p_schemes)
    if os.path.exists(p_scheme) and p_scheme not in candidates:
        candidates.append(p_scheme)

    if candidates:
        # Sort candidates by modification time (most recent first)
        candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
        target_path = candidates[0]

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def matches_list(value: str, allowed_list: Union[List[str], str, None]) -> bool:
    """
    Checks if a given value matches allowed_list.
    - Case-insensitive comparison.
    - Returns True if allowed_list is None, empty, or contains "All" / "all".
    """
    if allowed_list is None:
        return True
    if isinstance(allowed_list, str):
        allowed_list = [allowed_list]
    if not allowed_list:
        return True

    val_lower = str(value).strip().lower()
    allowed_lower = [str(item).strip().lower() for item in allowed_list]

    if "all" in allowed_lower:
        return True

    return val_lower in allowed_lower


def check_scheme_eligibility(
    user: Union[UserProfile, Dict[str, Any]], 
    scheme: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Checks a user's eligibility against a single scheme based on deterministic rules:
    - Age range (min_age, max_age)
    - Income limit (max_income)
    - State (states)
    - Occupation (occupations)
    - Category (categories)
    - Gender (genders)
    
    Returns dict with scheme name, eligible (bool), failed_on list, and scheme details.
    """
    if isinstance(user, UserProfile):
        u_age = user.age
        u_income = user.income
        u_state = user.state
        u_occupation = user.occupation
        u_category = user.category
        u_gender = user.gender
    else:
        u_age = user.get("age", 0)
        u_income = user.get("income", 0.0)
        u_state = user.get("state", "")
        u_occupation = user.get("occupation", "")
        u_category = user.get("category", "")
        u_gender = user.get("gender", "")

    failed_on: List[str] = []

    # Age criteria check
    min_age = scheme.get("min_age", scheme.get("age_min", scheme.get("min_age_years")))
    max_age = scheme.get("max_age", scheme.get("age_max", scheme.get("max_age_years")))
    if min_age is not None and u_age < min_age:
        failed_on.append("age")
    elif max_age is not None and u_age > max_age:
        failed_on.append("age")

    # Income criteria check
    min_income = scheme.get("min_income", scheme.get("income_min"))
    max_income = scheme.get("max_income", scheme.get("income_max", scheme.get("max_annual_income")))
    if min_income is not None and u_income < min_income:
        failed_on.append("income")
    elif max_income is not None and u_income > max_income:
        failed_on.append("income")

    # State criteria check
    states = scheme.get("states", scheme.get("state", scheme.get("eligible_states")))
    if states is not None and not matches_list(u_state, states):
        failed_on.append("state")

    # Occupation criteria check
    occupations = scheme.get("occupations", scheme.get("occupation", scheme.get("eligible_occupations")))
    if occupations is not None and not matches_list(u_occupation, occupations):
        failed_on.append("occupation")

    # Category criteria check
    categories = scheme.get("categories", scheme.get("category", scheme.get("eligible_categories", scheme.get("caste_category"))))
    if categories is not None and not matches_list(u_category, categories):
        failed_on.append("category")

    # Gender criteria check (if present in scheme)
    genders = scheme.get("genders", scheme.get("gender", scheme.get("eligible_genders")))
    if genders is not None and not matches_list(u_gender, genders):
        failed_on.append("gender")

    eligible = (len(failed_on) == 0)
    scheme_name = scheme.get("scheme", scheme.get("name", scheme.get("scheme_name", scheme.get("title", "Unknown Scheme"))))

    required_docs = scheme.get("required_documents", scheme.get("documents", scheme.get("docs", [])))
    if not isinstance(required_docs, list):
        required_docs = []

    official_src = scheme.get("official_source", scheme.get("website", scheme.get("source", "")))
    if not isinstance(official_src, str):
        official_src = str(official_src or "")

    app_link = scheme.get("application_link", scheme.get("apply_link", scheme.get("link", "")))
    if not isinstance(app_link, str):
        app_link = str(app_link or "")

    return {
        "scheme": str(scheme_name or "Unknown Scheme"),
        "eligible": bool(eligible),
        "failed_on": failed_on,
        "required_documents": [str(d) for d in required_docs if d is not None],
        "official_source": official_src,
        "application_link": app_link
    }


def run_rule_engine(
    user: Union[UserProfile, Dict[str, Any]], 
    schemes: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Runs check_scheme_eligibility across all schemes for a user profile."""
    return [check_scheme_eligibility(user, s) for s in schemes]
