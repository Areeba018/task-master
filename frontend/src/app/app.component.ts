import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar" [class.dark-theme]="themeService.isDark$ | async">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">TaskMaster</a>
        <div class="navbar-menu">
          <ng-container *ngIf="auth.isAuthenticated()">
            <a routerLink="/tasks" class="nav-link">Tasks</a>
            <div class="user-profile" (click)="toggleDropdown()">
              <div class="user-avatar">
                <span class="avatar-text">{{ getUserInitials() }}</span>
              </div>
              <div class="user-dropdown" [class.show]="isDropdownOpen">
                <div class="dropdown-header">
                  <span class="username">{{ auth.getCurrentUser()?.username }}</span>
                  <span class="email">{{ auth.getCurrentUser()?.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <button class="logout-btn" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </ng-container>
          <ng-container *ngIf="!auth.isAuthenticated()">
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/signup" class="nav-link signup">Sign Up</a>
          </ng-container>
          <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="'Toggle theme'">
            <span *ngIf="!(themeService.isDark$ | async)" class="theme-icon">🌙</span>
            <span *ngIf="themeService.isDark$ | async" class="theme-icon">☀️</span>
          </button>
        </div>
      </div>
    </nav>

    <main [class.dark-theme]="themeService.isDark$ | async">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* Light theme variables */
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #2d3748;
      --text-secondary: #4a5568;
      --border-color: #e2e8f0;
      --accent-color: #4299e1;
      --accent-hover: #3182ce;
      --danger-color: #e53e3e;
      --danger-hover: #c53030;
    }

    /* Dark theme variables */
    .dark-theme {
      --bg-primary: #1a202c;
      --bg-secondary: #2d3748;
      --text-primary: #f7fafc;
      --text-secondary: #e2e8f0;
      --border-color: #4a5568;
      --accent-color: #63b3ed;
      --accent-hover: #4299e1;
      --danger-color: #fc8181;
      --danger-hover: #f56565;
    }

    .navbar {
      background-color: var(--bg-primary);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.3s ease;
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
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .navbar-brand:hover {
      color: var(--accent-color);
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      padding: 0.5rem 1rem;
      border-radius: 6px;
    }

    .nav-link:hover {
      color: var(--accent-color);
      background-color: var(--bg-secondary);
    }

    .nav-link.signup {
      background-color: #63b3ed;
      color: #ffffff;
      padding: 0.5rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .nav-link.signup:hover {
      background-color: #4299e1;
      transform: translateY(-1px);
    }

    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: var(--text-secondary);
      background-color: var(--bg-primary);
    }

    .theme-toggle:hover {
      background-color: var(--bg-secondary);
    }

    .theme-icon {
      font-size: 1.25rem;
    }

    .user-profile {
      position: relative;
      cursor: pointer;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background-color: #63b3ed;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .user-profile:hover .user-avatar {
      transform: scale(1.05);
      background-color: #4299e1;
    }

    .avatar-text {
      color: #ffffff;
      font-weight: bold;
      font-size: 1.1rem;
      text-transform: uppercase;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
    }

    .dark-theme .user-dropdown {
      background-color: #1a202c;
    }

    .user-dropdown.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding-bottom: 0.5rem;
    }

    .username {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .email {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--border-color);
      margin: 0.5rem -1rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem;
      color: var(--danger-color);
      background: none;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      text-align: left;
    }

    .logout-btn:hover {
      color: var(--danger-hover);
      background-color: var(--bg-secondary);
    }

    main {
      min-height: calc(100vh - 64px);
      background-color: var(--bg-secondary);
      transition: all 0.3s ease;
    }
  `]
})
export class AppComponent {
  isDropdownOpen = false;

  constructor(
    public auth: AuthService,
    public themeService: ThemeService
  ) {}

  getUserInitials(): string {
    const user = this.auth.getCurrentUser();
    if (!user) return '';
    return user.username.charAt(0).toUpperCase();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.auth.logout();
  }
}
