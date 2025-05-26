import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">TaskMaster</a>
        <div class="navbar-menu">
          <a routerLink="/tasks" class="nav-link">Tasks</a>
        </div>
      </div>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2d3748;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .navbar-brand:hover {
      color: #4299e1;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: color 0.3s ease;
      padding: 0.5rem 1rem;
      border-radius: 6px;
    }

    .nav-link:hover {
      color: #4299e1;
      background-color: #ebf8ff;
    }

    main {
      min-height: calc(100vh - 64px);
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {}
