import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Todo, TodoCreate } from './todo.interface';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/`, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error loading todos:', error);
          return throwError(() => error);
        })
      );
  }

  createTodo(todo: TodoCreate): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos/`, todo, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Error creating todo:', error);
          return throwError(() => error);
        })
      );
  }

  updateTodoStatus(id: number, completed: boolean): Observable<Todo> {
    return this.http.patch<Todo>(
      `${this.apiUrl}/todos/${id}`,
      { completed },
      { withCredentials: true }
    ).pipe(
      catchError(error => {
        console.error('Error updating todo:', error);
        return throwError(() => error);
      })
    );
  }

  updateAllTodos(completed: boolean): Observable<Todo[]> {
    return this.http.patch<Todo[]>(
      `${this.apiUrl}/todos/`,
      { completed },
      { withCredentials: true }
    ).pipe(
      catchError(error => {
        console.error('Error updating all todos:', error);
        return throwError(() => error);
      })
    );
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/todos/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(error => {
        console.error('Error deleting todo:', error);
        return throwError(() => error);
      })
    );
  }
} 