import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar">
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

    .nav-link.signup {
      background-color: #4299e1;
      color: white;
    }

    .nav-link.signup:hover {
      background-color: #3182ce;
    }

    .user-profile {
      position: relative;
      cursor: pointer;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background-color: #4299e1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .user-profile:hover .user-avatar {
      transform: scale(1.05);
    }

    .avatar-text {
      color: white;
      font-weight: bold;
      font-size: 1.1rem;
      text-transform: uppercase;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
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
      color: #2d3748;
      font-size: 1rem;
    }

    .email {
      color: #718096;
      font-size: 0.875rem;
    }

    .dropdown-divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 0.5rem -1rem;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem;
      color: #e53e3e;
      background: none;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      text-align: left;
    }

    .logout-btn:hover {
      background-color: #fff5f5;
    }

    main {
      min-height: calc(100vh - 64px);
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {
  isDropdownOpen = false;

  constructor(public auth: AuthService) {}

  getUserInitials(): string {
    const user = this.auth.getCurrentUser();
    if (!user) return '';
    return user.username.charAt(0).toUpperCase();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.auth.logout();
  }
}
