from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json
import os

app = FastAPI()

class ExtractRequest(BaseModel):
    url: str

@app.post("/api/extract")
async def extract_components(request: ExtractRequest):
    """Extract UI components from a URL using the working Python extractor."""
    
    # Run the extraction script
    script_path = os.path.join(os.path.dirname(__file__), "..", "..", "extract.py")
    
    try:
        result = subprocess.run(
            ["python", script_path, request.url],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Extraction failed: {result.stderr[:500]}")
        
        # Parse the JSON output
        data = json.loads(result.stdout)
        
        return {
            "success": True,
            "url": data.get("url"),
            "status": data.get("status"),
            "componentCount": data.get("componentCount", 0),
            "components": data.get("components", [])
        }
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Extraction timed out after 30s")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse extraction output: {str(e)[:200]}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/extract")
async def extract_get(url: str = ""):
    """GET extraction — for quick testing."""
    if not url:
        raise HTTPException(status_code=400, detail="url parameter required")
    return await Extract_components(ExtractRequest(url=url))


@app.get("/api/health")
async def health():
    return {"status": "ok", "extractor": "python-html"}
