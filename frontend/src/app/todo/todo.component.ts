import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TodoService } from '../todo.service';
import { AuthService } from '../auth.service';
import { ThemeService } from '../theme.service';
import { Todo, TodoCreate } from '../todo.interface';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-app" [class.dark-theme]="themeService.isDark$ | async">
      <!-- Header -->
      <header class="header">
        <h1>TaskMaster</h1>
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
            <div class="complete-all-container">
              <label class="complete-all-label">
                <input
                  type="checkbox"
                  [checked]="allTodosCompleted()"
                  (change)="toggleAllTodos()"
                  [disabled]="isLoading || todos.length === 0"
                  class="checkbox complete-all-checkbox"
                />
                <span>Complete all tasks</span>
              </label>
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
                @if (editingTodo?.id === todo.id) {
                  <div class="edit-form">
                    <input
                      type="text"
                      [ngModel]="editingTodo?.title"
                      (ngModelChange)="editingTodo!.title = $event"
                      class="edit-input"
                      placeholder="Task title"
                      [disabled]="isLoading"
                    />
                    <input
                      type="text"
                      [ngModel]="editingTodo?.description"
                      (ngModelChange)="editingTodo!.description = $event"
                      class="edit-input"
                      placeholder="Description (optional)"
                      [disabled]="isLoading"
                    />
                    <div class="edit-actions">
                      <button 
                        class="save-button" 
                        (click)="saveEdit()"
                        [disabled]="isLoading || !editingTodo?.title?.trim()"
                      >
                        Save
                      </button>
                      <button 
                        class="cancel-button" 
                        (click)="cancelEdit()"
                        [disabled]="isLoading"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="todo-text">
                    <p class="todo-title">{{ todo.title }}</p>
                    @if (todo.description) {
                      <p class="todo-description">{{ todo.description }}</p>
                    }
                  </div>
                }
              </div>
              <div class="action-buttons">
                @if (editingTodo?.id !== todo.id) {
                  <button
                    (click)="startEdit(todo)"
                    class="edit-button"
                    title="Edit task"
                    [disabled]="isLoading"
                  >
                    ✎
                  </button>
                }
                <button
                  (click)="deleteTodo(todo)"
                  class="delete-button"
                  title="Delete task"
                  [disabled]="isLoading"
                >
                  ✕
                </button>
              </div>
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
      background: var(--bg-primary);
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: var(--text-primary);
      font-size: 24px;
    }

    .main-content {
      background: var(--bg-primary);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .add-todo-form {
      padding: 20px;
      display: flex;
      gap: 10px;
      border-bottom: 1px solid var(--border-color);
    }

    .add-button {
      padding: 8px 16px;
      background: var(--accent-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: var(--accent-hover);
      }

      &:disabled {
        background: var(--text-secondary);
        cursor: not-allowed;
      }
    }

    .complete-all-container {
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .complete-all-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-primary);
      font-size: 0.875rem;
      cursor: pointer;
      user-select: none;

      &:hover {
        color: var(--accent-color);
      }
    }

    .todo-list {
      padding: 20px;
    }

    .empty-state {
      text-align: center;
      color: var(--text-secondary);
      padding: 20px;
    }

    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid var(--border-color);
      animation: fadeIn 0.3s ease;
      background: var(--bg-primary);
      margin: 8px;
      border-radius: 4px;

      &:last-child {
        border-bottom: none;
      }

      &.completed .todo-title,
      &.completed .todo-description {
        text-decoration: line-through;
        color: var(--text-secondary);
      }
    }

    .todo-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .todo-text {
      flex: 1;
      transition: all 0.2s ease;
    }

    .todo-title {
      margin: 0;
      font-size: 1rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    .todo-description {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      padding: 0.5rem 0;
      animation: fadeIn 0.2s ease-in-out;
    }

    .edit-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.875rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      width: 100%;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
      }
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .save-button,
    .cancel-button {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
      }
    }

    .save-button {
      background: var(--accent-color);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-1px);
      }
    }

    .cancel-button {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);

      &:hover:not(:disabled) {
        background: var(--bg-secondary);
        transform: translateY(-1px);
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .edit-button,
    .delete-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      opacity: 0.8;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }

    .edit-button {
      color: var(--accent-color);
      font-size: 1.1rem;
      margin-right: 0.5rem;

      &:hover:not(:disabled) {
        opacity: 1;
        background: rgba(66, 153, 225, 0.1);
        transform: translateY(-1px);
      }
    }

    .delete-button {
      color: var(--danger-color);
      font-size: 18px;

      &:hover:not(:disabled) {
        opacity: 1;
        color: var(--danger-hover);
      }
    }
  `]
})
export class TodoComponent implements OnInit {
  todos: Todo[] = [];
  newTodo: TodoCreate = {
    title: '',
    description: ''
  };
  editingTodo: Todo | null = null;
  error: string | null = null;
  isLoading = false;

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.isLoading = true;
    this.error = null;
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to load tasks. Please try again.';
        }
      }
    });
  }

  addTodo() {
    if (this.newTodo.title.trim()) {
      this.isLoading = true;
      this.error = null;
      this.todoService.createTodo(this.newTodo).subscribe({
        next: (todo) => {
          this.todos.push(todo);
          this.newTodo = { title: '', description: '' };
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating todo:', error);
          this.isLoading = false;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          } else {
            this.error = 'Failed to create task. Please try again.';
          }
        }
      });
    }
  }

  toggleAllTodos(): void {
    const allCompleted = this.allTodosCompleted();
    this.isLoading = true;
    this.error = null;
    
    this.todoService.updateAllTodos(!allCompleted).subscribe({
      next: (todos) => {
        this.todos = todos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating all todos:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to update tasks. Please try again.';
        }
      }
    });
  }

  allTodosCompleted(): boolean {
    return this.todos.length > 0 && this.todos.every(todo => todo.completed);
  }

  toggleTodo(todo: Todo) {
    this.isLoading = true;
    this.error = null;
    this.todoService.updateTodoStatus(todo.id, !todo.completed).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error toggling todo:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to update task. Please try again.';
        }
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
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to delete task. Please try again.';
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  startEdit(todo: Todo): void {
    this.editingTodo = { ...todo };
  }

  cancelEdit(): void {
    this.editingTodo = null;
  }

  saveEdit(): void {
    if (!this.editingTodo || !this.editingTodo.title.trim()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const update: TodoCreate = {
      title: this.editingTodo.title,
      description: this.editingTodo.description
    };

    this.todoService.updateTodo(this.editingTodo.id, update).subscribe({
      next: (updatedTodo) => {
        const index = this.todos.findIndex(t => t.id === updatedTodo.id);
        if (index !== -1) {
          this.todos[index] = updatedTodo;
        }
        this.editingTodo = null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating todo:', error);
        this.isLoading = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = 'Failed to update task. Please try again.';
        }
      }
    });
  }
} 