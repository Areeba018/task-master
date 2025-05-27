import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Welcome to TaskMaster</h1>
        <p class="subtitle">Organize your tasks efficiently and boost your productivity</p>
        <div class="cta-buttons">
          <a routerLink="/tasks" class="btn btn-primary">Get Started</a>
        </div>
      </div>

      <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">✓</div>
            <h3>Task Management</h3>
            <p>Create, organize, and track your tasks with ease</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Quick Actions</h3>
            <p>Complete all tasks at once with a single click</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Modern Interface</h3>
            <p>Clean and intuitive design for the best user experience</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero-section {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 16px;
      margin-bottom: 4rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    h1 {
      font-size: 3.5rem;
      color: #2d3748;
      margin-bottom: 1rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #4a5568;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #4299e1;
      color: white;
      box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
    }

    .btn-primary:hover {
      background-color: #3182ce;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background-color: #718096;
      color: white;
      box-shadow: 0 4px 6px rgba(113, 128, 150, 0.2);
    }

    .btn-secondary:hover {
      background-color: #4a5568;
      transform: translateY(-2px);
    }

    .features-section {
      padding: 4rem 0;
    }

    .features-section h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #2d3748;
      margin-bottom: 3rem;
      font-weight: 700;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      padding: 0 1rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #4299e1;
      background: #ebf8ff;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto 1rem;
    }

    .feature-card h3 {
      color: #2d3748;
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .feature-card p {
      color: #4a5568;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 2.5rem;
      }

      .hero-section {
        padding: 3rem 1rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {} 