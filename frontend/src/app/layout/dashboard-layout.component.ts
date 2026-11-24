import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AiAssistantComponent } from '../features/assistant/ai-assistant.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiAssistantComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  readonly menuItems = [
    { label: 'HPD Reports', route: '/reports', icon: 'HP' },
    { label: 'Update Discharge Time', route: '/discharge-date', icon: 'DD' },
    { label: 'Update Death Date', route: '/death-date', icon: 'DT' },
    { label: 'Audit Log', route: '/reports/audit', icon: 'AL', requiresAdmin: true }
  ];

  readonly currentDateLabel = this.formatCurrentDate();
  readonly currentHijriLabel = this.formatCurrentHijriDate();

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  visibleMenuItems() {
    const role = this.authService.currentUser()?.role ?? '';
    return this.menuItems.filter((item) => !item.requiresAdmin || role === 'ADMIN');
  }

  canUseAiAssistant(): boolean {
    return this.authService.currentUser()?.role === 'ADMIN';
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }

  private formatCurrentDate(): string {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }

  private formatCurrentHijriDate(): string {
    const label = new Intl.DateTimeFormat('ms-MY-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    return label.replace(/\s*[Hh]$/, '').trim() + ' H';
  }
}
