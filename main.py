import os
import csv
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="ECTO // MEDEVAC Decision Intelligence API",
    description="Backend Python Web Service for Defence Medical Evacuation Resource Planner",
    version="1.0.0"
)

# Enable CORS for external access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "dist")
CSV_PATH = os.path.join(BASE_DIR, "public", "data", "hospital_availability.csv")

def parse_hospital_csv_file(filepath: str) -> List[dict]:
    if not os.path.exists(filepath):
        return []
    hospitals = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_spec = row.get("specialties", "")
            specialties = [s.strip() for s in raw_spec.split(";") if s.strip()]
            hospitals.append({
                "id": row.get("hospital_id", ""),
                "name": row.get("hospital_name", ""),
                "code": row.get("code", ""),
                "total_beds": int(row.get("total_beds", 40)),
                "available_beds": int(row.get("available_beds", 15)),
                "icu_beds": int(row.get("icu_beds", 10)),
                "available_icu_beds": int(row.get("available_icu_beds", 5)),
                "burn_beds": int(row.get("burn_beds", 4)),
                "operating_theaters_available": int(row.get("operating_theaters_available", 2)),
                "blood_units_available": int(row.get("blood_units_available", 30)),
                "intake_limit_per_hour": int(row.get("intake_limit_per_hour", 12)),
                "is_accepting_casualties": row.get("is_accepting_casualties", "true").lower() in ("true", "1", "yes"),
                "specialties": specialties,
                "contact_officer": row.get("contact_officer", ""),
                "lat": float(row.get("lat", 34.020)),
                "lng": float(row.get("lng", 74.720))
            })
    return hospitals

@app.get("/api/health")
def health_check():
    """Healthcheck endpoint for Render zero-downtime monitoring"""
    return {
        "status": "healthy",
        "service": "ECTO // MEDEVAC Quantum-Assisted Defence Planner",
        "backend": "Python FastAPI Web Service",
        "engine": "Multi-Wave Hybrid Classical-Quantum QAOA Solver",
        "team": "Techpulse (CAN-TEAM-000466)"
    }

@app.get("/api/hospitals")
def get_hospitals():
    """Returns real-time hospital bed and service availability from CSV"""
    hospitals = parse_hospital_csv_file(CSV_PATH)
    return {
        "source": "hospital_availability.csv",
        "count": len(hospitals),
        "hospitals": hospitals
    }

@app.post("/api/hospitals/upload")
async def upload_hospital_csv(file: UploadFile = File(...)):
    """Receives uploaded CSV from field coordinators, updates dataset and returns parsed records"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")
    content = await file.read()
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, "wb") as f:
        f.write(content)
    hospitals = parse_hospital_csv_file(CSV_PATH)
    return {
        "message": f"Successfully ingested {len(hospitals)} hospitals from {file.filename}",
        "filename": file.filename,
        "count": len(hospitals),
        "hospitals": hospitals
    }

# Serve React / Vite Frontend SPA
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    data_dir = os.path.join(DIST_DIR, "data")
    if os.path.exists(data_dir):
        app.mount("/data", StaticFiles(directory=data_dir), name="data")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"error": "Frontend build not found. Run 'npm run build' first."}, status_code=404)
else:
    @app.get("/")
    def index():
        return {"message": "Python API running. Run 'npm run build' to generate frontend UI."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
