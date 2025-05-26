from fastapi import FastAPI, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import sqlite3
from database import (
    create_user, verify_user, init_db as init_database,
    create_session, delete_session
)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Todo(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False

class UpdateAllTodosRequest(BaseModel):
    completed: bool

# Initialize database
init_database()

@app.post("/auth/signup", response_model=User)
async def signup(user: UserCreate):
    print(f"Attempting to create user: {user.username}")
    result = create_user(user.username, user.email, user.password)
    if result is None:
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists"
        )
    print(f"User created successfully: {result}")
    return result

@app.post("/auth/login", response_model=User)
async def login(user: UserLogin, response: Response):
    print(f"Attempting to verify user: {user.username}")
    result = verify_user(user.username, user.password)
    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )
    
    # Create session token
    session_token = create_session(result['id'])
    if not session_token:
        raise HTTPException(
            status_code=500,
            detail="Failed to create session"
        )
    
    # Set session cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    print(f"User verified successfully: {result}")
    return result

@app.post("/auth/logout")
async def logout(
    response: Response,
    session_token: str = Cookie(None)
):
    if session_token:
        # Delete the session from database
        delete_session(session_token)
    
    # Clear the session cookie
    response.delete_cookie(
        key="session_token",
        httponly=True,
        secure=True,
        samesite="strict"
    )
    
    return {"message": "Logged out successfully"}

@app.get("/todos/", response_model=List[Todo])
async def get_todos():
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM todos')
    todos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return todos

@app.post("/todos/", response_model=Todo)
async def create_todo(todo: TodoCreate):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO todos (title, description) VALUES (?, ?)',
        (todo.title, todo.description)
    )
    conn.commit()
    
    # Get the created todo
    cursor.execute(
        'SELECT * FROM todos WHERE id = ?',
        (cursor.lastrowid,)
    )
    created_todo = dict(cursor.fetchone())
    conn.close()
    return created_todo

@app.patch("/todos/", response_model=List[Todo])
async def update_all_todos(request: UpdateAllTodosRequest):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Update all todos
    cursor.execute(
        'UPDATE todos SET completed = ?',
        (request.completed,)
    )
    conn.commit()
    
    # Get all updated todos
    cursor.execute('SELECT * FROM todos')
    todos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return todos

@app.patch("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, request: UpdateAllTodosRequest):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Update the specific todo
    cursor.execute(
        'UPDATE todos SET completed = ? WHERE id = ?',
        (request.completed, todo_id)
    )
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # Get the updated todo
    cursor.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
    todo = dict(cursor.fetchone())
    conn.close()
    return todo

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    conn = sqlite3.connect('todos.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    return {"message": "Todo deleted successfully"} 