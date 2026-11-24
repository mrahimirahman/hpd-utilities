import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ReportMenuItem {
  title: string;
  description: string;
  route: string;
  status: 'Ready' | 'Pending';
  frequency: string;
}

@Component({
  selector: 'app-reports-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-menu.component.html',
  styleUrl: './reports-menu.component.css'
})
export class ReportsMenuComponent {
  readonly reportItems: ReportMenuItem[] = [
    {
      title: 'Update PD103 Bancian Harian Wad',
      description: 'Modul sedia ada untuk semakan, cetakan, dan kemas kini data PD103.',
      route: '/reports/pd103',
      status: 'Ready',
      frequency: 'Harian'
    },
    {
      title: 'Data Lean',
      description: 'Menu awal untuk report Data Lean.',
      route: '/reports/lean',
      status: 'Pending',
      frequency: 'TBC'
    },
    {
      title: 'Data Admission (ETD) Bulanan',
      description: 'Menu awal untuk laporan admission ETD secara bulanan.',
      route: '/reports/admission-etd',
      status: 'Pending',
      frequency: 'Bulanan'
    },
    {
      title: 'Data Diagnosis DAMA Bulanan',
      description: 'Pilih tempoh tarikh dan jana fail Excel untuk kes discaj jenis DAMA.',
      route: '/reports/dama-diagnosis',
      status: 'Ready',
      frequency: 'Bulanan'
    },
    {
      title: 'Referral Jabatan Kecemasan ke Psikiatri',
      description: 'Menu awal untuk laporan tahunan referral dari Jabatan Kecemasan.',
      route: '/reports/referral-emergency-psychiatry',
      status: 'Pending',
      frequency: 'Tahunan'
    },
    {
      title: 'Referral Jabatan Lain ke Psikiatri',
      description: 'Menu awal untuk laporan tahunan referral dari Medical, Surgical, Ortho, O&G dan Paeds.',
      route: '/reports/referral-other-departments-psychiatry',
      status: 'Pending',
      frequency: 'Tahunan'
    },
    {
      title: 'Data Semua UserID Aktif',
      description: 'Menu awal untuk listing semua userID yang masih aktif.',
      route: '/reports/active-user-ids',
      status: 'Pending',
      frequency: 'Semasa'
    },
    {
      title: 'Pesakit Tanpa Discharge Summary Baharu',
      description: 'Menu awal untuk exception report selepas pembatalan discharge summary.',
      route: '/reports/discharge-summary-exception',
      status: 'Pending',
      frequency: 'Permohonan baharu'
    },
    {
      title: 'Kes Rujukan ke Psikiatri Mengikut Jenis Kes',
      description: 'Menu awal untuk pecahan kes baharu dan kes ulangan.',
      route: '/reports/referral-case-breakdown',
      status: 'Pending',
      frequency: 'Tahunan'
    }
  ];
}
