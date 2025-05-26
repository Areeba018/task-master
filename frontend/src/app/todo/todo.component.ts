import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../todo.service';
import { AuthService } from '../auth.service';
import { Todo, TodoCreate } from '../todo.interface';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-app">
      <!-- Header -->
      <header class="header">
        <h1>TaskMaster</h1>
        <button (click)="logout()" class="logout-button">Logout</button>
      </header>

      <!-- Main content -->
      <main class="main-content">
        <!-- Error message -->
        @if (error) {
          <div class="error-message">
            {{ error }}
          </div>
        }

        <!-- Add todo form -->
        <div class="add-todo-form">
          <input
            type="text"
            [(ngModel)]="newTodo.title"
            placeholder="Enter task title"
            class="input-field"
            [disabled]="isLoading"
          />
          <input
            type="text"
            [(ngModel)]="newTodo.description"
            placeholder="Enter description"
            class="input-field"
            [disabled]="isLoading"
          />
          <button
            (click)="addTodo()"
            [disabled]="!newTodo.title.trim() || isLoading"
            class="add-button"
          >
            {{ isLoading ? 'Adding...' : 'Add Task' }}
          </button>
        </div>

        <!-- Loading state -->
        @if (isLoading && todos.length === 0) {
          <div class="loading-state">
            Loading tasks...
          </div>
        }

        <!-- Todo list -->
        <div class="todo-list">
          @if (todos.length === 0 && !isLoading) {
            <div class="empty-state">
              No tasks available. Add your first task above!
            </div>
          } @else {
            <div class="todo-actions">
              <button
                (click)="acceptAllTodos()"
                class="accept-all-button"
                [disabled]="isLoading || allTodosCompleted()"
              >
                Accept All
              </button>
            </div>
          }
          @for (todo of todos; track todo.id) {
            <div class="todo-item" [class.completed]="todo.completed">
              <div class="todo-content">
                <input
                  type="checkbox"
                  [checked]="todo.completed"
                  (change)="toggleTodo(todo)"
                  class="checkbox"
                  [disabled]="isLoading"
                />
                <div class="todo-text">
                  <p class="todo-title">{{ todo.title }}</p>
                  @if (todo.description) {
                    <p class="todo-description">{{ todo.description }}</p>
                  }
                </div>
              </div>
              <button
                (click)="deleteTodo(todo)"
                class="delete-button"
                title="Delete task"
                [disabled]="isLoading"
              >
                ✕
              </button>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .todo-app {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .logout-button {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-button:hover {
      background: #c82333;
    }

    .main-content {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .add-todo-form {
      padding: 20px;
      display: flex;
      gap: 10px;
      border-bottom: 1px solid #eee;
    }

    .input-field {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      flex: 1;
    }

    .input-field:focus {
      outline: none;
      border-color: #007bff;
    }

    .add-button, .accept-all-button {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .add-button:hover, .accept-all-button:hover {
      background: #0056b3;
    }

    .add-button:disabled, .accept-all-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .todo-actions {
      padding: 10px 20px;
      border-bottom: 1px solid #eee;
    }

    .todo-list {
      padding: 20px;
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 20px;
    }

    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid #eee;
      animation: fadeIn 0.3s ease;
    }

    .todo-item:last-child {
      border-bottom: none;
    }

    .todo-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .todo-text {
      flex: 1;
    }

    .todo-title {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .todo-description {
      margin: 4px 0 0;
      font-size: 14px;
      color: #666;
    }

    .completed .todo-title,
    .completed .todo-description {
      text-decoration: line-through;
      color: #999;
    }

    .delete-button {
      background: none;
      border: none;
      color: #ff4444;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      opacity: 0.7;
    }

    .delete-button:hover {
      opacity: 1;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      margin: 0 20px 20px;
      border-radius: 4px;
      text-align: center;
    }

    .loading-state {
      text-align: center;
      color: #666;
      padding: 20px;
    }

    .input-field:disabled,
    .add-button:disabled,
    .checkbox:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: TodoCreate = {
    title: '',
    description: ''
  };
  error: string | null = null;
  isLoading = false;

  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.isLoading = true;
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
        this.error = null;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.error = 'Failed to load tasks. Please try again.';
        this.isLoading = false;
      }
    });
  }

  addTodo() {
    if (!this.newTodo.title.trim()) return;

    this.isLoading = true;
    this.error = null;

    this.todoService.createTodo(this.newTodo).subscribe({
      next: (todo) => {
        this.todos.unshift(todo);
        this.newTodo = { title: '', description: '' };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error adding todo:', error);
        this.error = 'Failed to add task. Please try again.';
        this.isLoading = false;
      }
    });
  }

  acceptAllTodos() {
    this.isLoading = true;
    this.error = null;

    this.todoService.updateAllTodos(true).subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error accepting all todos:', error);
        this.error = 'Failed to accept all tasks. Please try again.';
        this.isLoading = false;
      }
    });
  }

  allTodosCompleted(): boolean {
    return this.todos.every(todo => todo.completed);
  }

  toggleTodo(todo: Todo) {
    this.isLoading = true;
    this.error = null;

    this.todoService.updateTodoStatus(todo.id, !todo.completed).subscribe({
      next: (response: Todo) => {
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = response;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error updating todo:', error);
        this.error = 'Failed to update task. Please try again.';
        this.isLoading = false;
      }
    });
  }

  deleteTodo(todo: Todo) {
    this.isLoading = true;
    this.error = null;

    this.todoService.deleteTodo(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.filter(t => t.id !== todo.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting todo:', error);
        this.error = 'Failed to delete task. Please try again.';
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
} 