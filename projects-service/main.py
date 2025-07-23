# projects-service/main.py
from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
import jwt, os, bson

# --------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------
MONGO_URL  = os.getenv("MONGO_URL",  "mongodb://projects-db:27017")
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-dev-key")
DB_NAME    = os.getenv("MONGO_DB",   "devopstrack")
COLL_NAME  = "projects"

# --------------------------------------------------------------------
# FastAPI & MongoDB
# --------------------------------------------------------------------
app    = FastAPI(title="Projects‑Service")
router = APIRouter(prefix="/api/projects", tags=["projects"])

client        = AsyncIOMotorClient(MONGO_URL)
projects_col  = client[DB_NAME][COLL_NAME]

def mongo_to_dict(doc: dict) -> dict:
    """Convertit le document Mongo → dict JSON‐able."""
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    return d

# --------------------------------------------------------------------
# Authentification JWT
# --------------------------------------------------------------------
oauth2 = OAuth2PasswordBearer(tokenUrl="token")          # /token non exposé ici

async def current_user(token: str = Depends(oauth2)) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
        )

# --------------------------------------------------------------------
# Schémas Pydantic
# --------------------------------------------------------------------
class Project(BaseModel):
    id:   str | None = Field(default=None)
    name: str
    repo: str | None = None
    env:  str = "dev"

class ProjectCreate(BaseModel):
    name: str
    repo: str | None = None
    env:  str = "dev"

# --------------------------------------------------------------------
# End‑points
# --------------------------------------------------------------------
@router.get("", response_model=list[Project])
async def list_projects(_: dict = Depends(current_user)):
    docs = await projects_col.find().to_list(200)
    return [mongo_to_dict(d) for d in docs]

@router.post("", response_model=Project, status_code=201)
async def create_project(p: ProjectCreate, _: dict = Depends(current_user)):
    inserted = await projects_col.insert_one(p.model_dump())
    doc = p.model_dump()
    doc["id"] = str(inserted.inserted_id)
    return doc

# --------------------------------------------------------------------
# Register router & health check
# --------------------------------------------------------------------
app.include_router(router)

@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
