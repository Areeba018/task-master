import motor.motor_asyncio
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

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