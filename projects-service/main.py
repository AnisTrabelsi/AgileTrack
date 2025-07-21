from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
import jwt, os

app = FastAPI(title="Projects‑Service")

# 🔗 Connexion à la base de données MongoDB
MONGO_URL = os.getenv("MONGO_URL", "mongodb://projects-db:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["devopstrack"]
projects_col = db["projects"]

# 🔐 Authentification via JWT
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-dev-key")
oauth2 = OAuth2PasswordBearer(tokenUrl="token")  # requis par Depends, même si /token n’est pas encore implémenté

def verify_jwt(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )

# 🧱 Schéma de données du projet
class Project(BaseModel):
    id: str | None = Field(alias="id", default=None)
    name: str
    repo: str
    env: str = "dev"

# 📦 Endpoints
@app.get("/projects", response_model=list[Project])
async def list_projects(_: dict = Depends(verify_jwt)):
    docs = await projects_col.find().to_list(100)
    return docs

@app.post("/projects", response_model=Project, status_code=201)
async def create_project(p: Project, _: dict = Depends(verify_jwt)):
    doc = p.model_dump(by_alias=True, exclude={"id"})
    res = await projects_col.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc
