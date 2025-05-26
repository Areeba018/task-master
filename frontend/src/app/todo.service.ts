import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, TodoCreate } from './todo.interface';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/`);
  }

  createTodo(todo: TodoCreate): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos/`, todo);
  }

  updateTodoStatus(id: number, completed: boolean): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/todos/${id}`, { completed });
  }

  updateAllTodos(completed: boolean): Observable<Todo[]> {
    return this.http.patch<Todo[]>(`${this.apiUrl}/todos/`, { completed });
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/todos/${id}`);
  }
} 