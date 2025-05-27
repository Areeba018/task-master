import sqlite3
from sqlite3 import Error
from typing import List, Dict, Optional
import bcrypt
from datetime import datetime, timedelta

def create_connection():
    try:
        print("Attempting to connect to SQLite database: todos.db")
        conn = sqlite3.connect('todos.db')
        conn.row_factory = sqlite3.Row  # This enables column access by name
        print("Successfully connected to database")
        return conn
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def init_db():
    print("Initializing database...")
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            
            # Enable foreign keys
            cursor.execute('PRAGMA foreign_keys = ON;')
            
            print("Creating users table...")
            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash BLOB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            print("Recreating todos table...")
            # Drop and recreate todos table with user_id foreign key
            cursor.execute('DROP TABLE IF EXISTS todos')
            cursor.execute('''
                CREATE TABLE todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT FALSE,
                    user_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')

            print("Creating sessions table...")
            # Create sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_token TEXT UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Drop task_history table if it exists
            cursor.execute('DROP TABLE IF EXISTS task_history')
            
            # Verify tables were created
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"Created tables: {[table[0] for table in tables]}")
            
            conn.commit()
            print("Database initialized successfully")
        except Error as e:
            print(f"Error creating tables: {e}")
        finally:
            conn.close()
            print("Database connection closed")
    else:
        print("Error: Could not establish database connection")

# User Management Functions
def create_user(username: str, email: str, password: str) -> Optional[Dict]:
    conn = create_connection()
    if conn is not None:
        try:
            # Hash the password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cursor = conn.cursor()
            print(f"Attempting to create user: {username}")
            
            cursor.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            conn.commit()
            
            # Fetch the created user
            cursor.execute(
                'SELECT id, username, email FROM users WHERE id = ?',
                (cursor.lastrowid,)
            )
            user = cursor.fetchone()
            
            if user:
                print(f"User created successfully: {username}")
                return dict(user)
            else:
                print("User creation succeeded but fetch failed")
                return None
                
        except sqlite3.IntegrityError as e:
            print(f"IntegrityError creating user: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error creating user: {e}")
            return None
        finally:
            conn.close()
    return None

def verify_user(username: str, password: str) -> Optional[Dict]:
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, username, email, password_hash FROM users WHERE username = ?',
                (username,)
            )
            user = cursor.fetchone()
            
            if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
                return {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email']
                }
        finally:
            conn.close()
    return None

# Session Management Functions
def create_session(user_id: int) -> Optional[str]:
    conn = create_connection()
    if conn is not None:
        try:
            # Generate session token
            session_token = bcrypt.gensalt().hex()
            expires_at = datetime.utcnow() + timedelta(days=7)
            
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
                (user_id, session_token, expires_at)
            )
            conn.commit()
            return session_token
        finally:
            conn.close()
    return None

def verify_session(session_token: str) -> Optional[Dict]:
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT u.id, u.username, u.email 
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.session_token = ? AND s.expires_at > ?
            ''', (session_token, datetime.utcnow()))
            
            result = cursor.fetchone()
            if result:
                return dict(result)
        finally:
            conn.close()
    return None

def delete_session(session_token: str) -> bool:
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM sessions WHERE session_token = ?', (session_token,))
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()
    return False

# Updated Todo Functions to include user_id
def get_user_todos(user_id: int) -> List[Dict]:
    """Get all todos for a user with their latest status."""
    conn = create_connection()
    todos = []
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    t.id,
                    t.title,
                    t.description,
                    t.completed,
                    t.created_at,
                    t.last_modified_at,
                    u.username as created_by
                FROM todos t
                JOIN users u ON t.user_id = u.id
                WHERE t.user_id = ?
                ORDER BY t.completed ASC, t.last_modified_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            for row in rows:
                todos.append(dict(row))
        except Exception as e:
            print(f"Error fetching todos: {e}")
        finally:
            conn.close()
    return todos

def create_todo(user_id: int, title: str, description: Optional[str] = None) -> Optional[Dict]:
    """Create a new todo."""
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            now = datetime.utcnow()
            
            cursor.execute(
                'INSERT INTO todos (title, description, user_id, created_at, last_modified_at) VALUES (?, ?, ?, ?, ?)',
                (title, description, user_id, now, now)
            )
            conn.commit()
            todo_id = cursor.lastrowid
            
            # Return the created todo
            cursor.execute('''
                SELECT 
                    t.id,
                    t.title,
                    t.description,
                    t.completed,
                    t.created_at,
                    t.last_modified_at,
                    u.username as created_by
                FROM todos t
                JOIN users u ON t.user_id = u.id
                WHERE t.id = ?
            ''', (todo_id,))
            return dict(cursor.fetchone())
        except Exception as e:
            print(f"Error creating todo: {e}")
            return None
        finally:
            conn.close()
    return None

def update_todo_status(user_id: int, todo_id: int, completed: bool) -> Optional[Dict]:
    """Update a todo's status."""
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            now = datetime.utcnow()
            
            cursor.execute(
                'UPDATE todos SET completed = ?, last_modified_at = ? WHERE id = ? AND user_id = ?',
                (completed, now, todo_id, user_id)
            )
            conn.commit()
            
            if cursor.rowcount > 0:
                cursor.execute('''
                    SELECT 
                        t.id,
                        t.title,
                        t.description,
                        t.completed,
                        t.created_at,
                        t.last_modified_at,
                        u.username as created_by
                    FROM todos t
                    JOIN users u ON t.user_id = u.id
                    WHERE t.id = ?
                ''', (todo_id,))
                return dict(cursor.fetchone())
            return None
        except Exception as e:
            print(f"Error updating todo: {e}")
            return None
        finally:
            conn.close()
    return None

def delete_todo(user_id: int, todo_id: int) -> bool:
    """Delete a todo permanently."""
    conn = create_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            cursor.execute(
                'DELETE FROM todos WHERE id = ? AND user_id = ?',
                (todo_id, user_id)
            )
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print(f"Error deleting todo: {e}")
            return False
        finally:
            conn.close()
    return False

# Initialize the database
init_db() 