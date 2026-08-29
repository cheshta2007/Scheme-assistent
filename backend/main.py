import os
import logging
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from models import UserProfile, SchemeResult
from rule_engine import load_schemes, run_rule_engine
from llm_explainer import explain_result

logger = logging.getLogger("uvicorn")

app = FastAPI(
    title="AI-Powered Scheme Assistance Agent",
    description="Phase 4 Eligibility Rule Engine & LLM Explanation Backend API",
    version="1.0.0"
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_schemes_file_path() -> str:
    """Returns path to schemes JSON file, checking both schemes.json and scheme.json and returning the newest modified file."""
    base_dir = os.path.dirname(__file__)
    primary = os.path.join(base_dir, "schemes.json")
    secondary = os.path.join(base_dir, "scheme.json")
    
    if os.path.exists(primary) and os.path.exists(secondary):
        if os.path.getmtime(secondary) > os.path.getmtime(primary):
            return secondary
        return primary
    elif os.path.exists(secondary):
        return secondary
    return primary


SCHEMES_FILE_PATH = get_schemes_file_path()


# ==========================================
# 1. API Endpoints
# ==========================================

@app.post("/check-eligibility")
def check_eligibility(user: UserProfile) -> Dict[str, Any]:
    """Accepts UserProfile JSON body, evaluates rules against loaded schemes, returns eligibility results."""
    schemes = load_schemes(get_schemes_file_path())
    results = [SchemeResult(**r) for r in run_rule_engine(user, schemes)]
    eligible_count = sum(1 for r in results if r.eligible)
    return {
        "total_schemes_checked": len(schemes),
        "eligible_count": eligible_count,
        "results": results
    }


@app.post("/check-eligibility-with-explanation")
def check_eligibility_with_explanation(user: UserProfile) -> Dict[str, Any]:
    """Accepts UserProfile JSON body, evaluates rules against loaded schemes, generates explanations, returns results."""
    schemes = load_schemes(get_schemes_file_path())
    raw_results = run_rule_engine(user, schemes)
    user_dict = user.dict() if hasattr(user, "dict") else user.model_dump()

    results = []
    for r in raw_results:
        res_dict = dict(r)
        try:
            res_dict["explanation"] = explain_result(user_dict, res_dict)
        except Exception:
            from llm_explainer import _get_fallback_explanation
            res_dict["explanation"] = _get_fallback_explanation(
                res_dict.get("scheme", "Scheme"),
                res_dict.get("eligible", False),
                res_dict.get("failed_on", [])
            )
        results.append(SchemeResult(**res_dict))

    eligible_count = sum(1 for r in results if r.eligible)
    return {
        "total_schemes_checked": len(schemes),
        "eligible_count": eligible_count,
        "results": results
    }


@app.get("/schemes")
def get_schemes() -> List[Dict[str, Any]]:
    """Returns the full raw list of schemes."""
    return load_schemes(get_schemes_file_path())


@app.get("/api/health")
def api_health() -> Dict[str, str]:
    """API Health check endpoint."""
    return {
        "status": "ok",
        "message": "Scheme Assistant Backend API is running"
    }


# ==========================================
# 2. Static File Serving & SPA Fallback Route
# ==========================================

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
index_html = frontend_dist / "index.html"

if frontend_dist.exists() and index_html.exists():
    # Mount assets directory if present
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        requested_file = frontend_dist / full_path
        if full_path and requested_file.exists() and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(index_html)
else:
    logger.warning(
        f"Frontend build folder not found at '{frontend_dist}'. "
        "Static file serving disabled. Run 'npm run build' inside frontend/ to produce static files."
    )

    @app.get("/")
    def health_check() -> Dict[str, str]:
        """Fallback health check endpoint when frontend build is missing."""
        return {
            "status": "ok",
            "message": "Scheme Assistant Backend API is running (Frontend build not found)"
        }
