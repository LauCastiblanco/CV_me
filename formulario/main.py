import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from pathlib import Path

# Carga el .env que está junto a este archivo (formulario/.env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# Lee tu SECRET KEY de reCAPTCHA 
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")  
VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

app = FastAPI()

#  llama el frontend (tu dominio de Vercel + local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://formulario-laurakcv.vercel.app",  #  dominio en Vercel
        "http://127.0.0.1:5500", "http://localhost:5500",  # Live Server local
        "http://127.0.0.1", "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerifyBody(BaseModel):
    token: str  # token que envía el navegador (grecaptcha.getResponse())

@app.get("/")
def root():
    return {"message": "OK - reCAPTCHA API listo"}

# Endpoint que VERIFICA el token contra Google
@app.post("/api/verify")
async def verify(body: VerifyBody):
    if not RECAPTCHA_SECRET:
        raise HTTPException(status_code=500, detail="Falta RECAPTCHA_SECRET en el servidor (.env)")

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post( VERIFY_URL,
            data={"secret": RECAPTCHA_SECRET, "response": body.token}
        )
        data = resp.json()
        # data = {'success': True/False, 'challenge_ts':..., 'hostname':..., 'error-codes':[...] }

    return {"success": bool(data.get("success")), "error_codes": data.get("error-codes")}
