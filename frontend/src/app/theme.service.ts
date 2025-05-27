import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = new BehaviorSubject<boolean>(this.getInitialTheme());
  isDark$ = this.isDark.asObservable();

  constructor() {
    // Apply initial theme
    this.applyTheme(this.isDark.value);
  }

  private getInitialTheme(): boolean {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }

  toggleTheme() {
    const newTheme = !this.isDark.value;
    this.isDark.next(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    this.applyTheme(newTheme);
  }

  getCurrentTheme(): string {
    return this.isDark.value ? 'dark' : 'light';
  }
} 