from fastapi import FastAPI, HTTPException, Response, Cookie, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import sqlite3
from datetime import datetime
from database import (
    create_user, verify_user, init_db as init_database,
    create_session, delete_session, verify_session
)

app = FastAPI()

# Enable CORS with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Your frontend URL
    allow_credentials=True, # Allows sending cookies, authorization headers, or TLS client certificates. Useful if you're using sessions or tokens.
    allow_methods=["*"], # Allows all HTTP methods (GET, POST, PUT, etc.). "*" means all methods.
    allow_headers=["*"], # Allows all headers
    expose_headers=["*"], # Allows all headers to be exposed to the frontend
    max_age=3600, #  How long (in seconds) the results of a preflight request (like OPTIONS) can be cached. 3600 seconds = 1 hour.
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

# Authentication dependency
async def get_current_user(session_token: str = Cookie(None)) -> User:
    print(f"Checking authentication with token: {session_token}")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = verify_session(session_token)
    print(f"Verified session result: {user}")
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    
    return User(**user)

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
        secure=False,  # Set to False for development
        samesite="lax",  # Changed from strict to lax
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    print(f"User verified successfully: {result}")
    print(f"Session token created: {session_token}")
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
async def get_todos(current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM todos WHERE user_id = ?', (current_user.id,))
    todos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return todos

@app.post("/todos/", response_model=Todo)
async def create_todo(todo: TodoCreate, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)',
        (todo.title, todo.description, current_user.id)
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
async def update_all_todos(request: UpdateAllTodosRequest, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Update all todos for the current user
    cursor.execute(
        'UPDATE todos SET completed = ? WHERE user_id = ?',
        (request.completed, current_user.id)
    )
    conn.commit()
    
    # Get all updated todos for the current user
    cursor.execute('SELECT * FROM todos WHERE user_id = ?', (current_user.id,))
    todos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return todos

@app.patch("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, request: UpdateAllTodosRequest, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Update the specific todo only if it belongs to the current user
    cursor.execute(
        'UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?',
        (request.completed, todo_id, current_user.id)
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

@app.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo: TodoCreate, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # First check if the todo exists and belongs to the user
    cursor.execute(
        'SELECT * FROM todos WHERE id = ? AND user_id = ?',
        (todo_id, current_user.id)
    )
    existing_todo = cursor.fetchone()
    
    if not existing_todo:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # Update the todo
    cursor.execute(
        '''
        UPDATE todos 
        SET title = ?, description = ?, last_modified_at = ?
        WHERE id = ? AND user_id = ?
        ''',
        (todo.title, todo.description, datetime.utcnow(), todo_id, current_user.id)
    )
    conn.commit()
    
    # Get the updated todo
    cursor.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
    updated_todo = dict(cursor.fetchone())
    conn.close()
    
    return updated_todo

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int, current_user: User = Depends(get_current_user)):
    conn = sqlite3.connect('todos.db')
    cursor = conn.cursor()
    
    # Delete the todo only if it belongs to the current user
    cursor.execute(
        'DELETE FROM todos WHERE id = ? AND user_id = ?',
        (todo_id, current_user.id)
    )
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Todo not found")
        
    conn.close()
    return {"message": "Todo deleted successfully"} 