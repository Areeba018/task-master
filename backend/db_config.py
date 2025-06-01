import motor.motor_asyncio
from bson import ObjectId
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Get the environment
ENV = os.getenv("ENV", "development")

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Database configuration
if ENV == "production":
    # In production, use a specific directory that Render.com persists
    DB_PATH = "/opt/render/project/src/todos.db"
else:
    # In development, use local directory
    DB_PATH = str(BASE_DIR / "todos.db")

# Create the database directory in production
if ENV == "production":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# SQLite URL
DATABASE_URL = f"sqlite:///{DB_PATH}"

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://your-mongodb-url")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.taskmaster

# Helper function to convert MongoDB _id to string
def serialize_id(item):
    if item and '_id' in item:
        item['id'] = str(item['_id'])
        del item['_id']
    return item

# Collections
users_collection = db.users
todos_collection = db.todos
sessions_collection = db.sessions 