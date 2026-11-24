import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api.config';

interface DischargeEncounterRow {
  encounterId: string;
  admissionId: string;
  patientMrn: string;
  personName: string;
  personNewIc: string;
  dischargeWard: string;
  dischargeWardName: string | null;
  encounterDate: string;
  encounterDischargeDate: string | null;
  encDischargeDate: string | null;
  preDischargeDate: string | null;
  preDischargeTime: string | null;
}

interface DischargeDateAuditEntry {
  id: number;
  encounterId: string;
  patientMrn: string;
  encounterDischargeDateBefore: string | null;
  encounterDischargeDateAfter: string | null;
  encDischargeDateBefore: string | null;
  encDischargeDateAfter: string | null;
  preDischargeDateBefore: string | null;
  preDischargeDateAfter: string | null;
  preDischargeTimeBefore: string | null;
  preDischargeTimeAfter: string | null;
  reason: string | null;
  editedBy: string;
  editedName: string;
  editedAt: string;
}

@Component({
  selector: 'app-discharge-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discharge-date.component.html',
  styleUrl: './discharge-date.component.css'
})
export class DischargeDateComponent {
  readonly rows = signal<DischargeEncounterRow[]>([]);
  readonly selected = signal<DischargeEncounterRow | null>(null);
  readonly auditEntries = signal<DischargeDateAuditEntry[]>([]);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isSearching = signal(false);
  readonly isSaving = signal(false);
  readonly hasSearched = signal(false);

  mrn = '';
  dischargeDate = '';
  preDischargeDate = '';
  preDischargeTime = '';
  reason = '';

  constructor(private readonly http: HttpClient) {}

  search(): void {
    const mrn = this.mrn.trim();
    if (!mrn) {
      this.errorMessage.set('Sila masukkan MRN pesakit.');
      return;
    }

    this.isSearching.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selected.set(null);
    this.auditEntries.set([]);

    const params = new HttpParams().set('mrn', mrn);
    this.http.get<DischargeEncounterRow[]>(`${API_BASE_URL}/discharge-date/encounters`, { params }).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.hasSearched.set(true);
        this.isSearching.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.hasSearched.set(true);
        this.isSearching.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to search patient encounters.');
      }
    });
  }

  select(row: DischargeEncounterRow): void {
    this.selected.set(row);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.dischargeDate = this.dateTimeLocal(row.encounterDischargeDate)
      || (row.encDischargeDate ? `${this.datePart(row.encDischargeDate)}T00:00` : '');
    this.preDischargeDate = this.datePart(row.preDischargeDate);
    this.preDischargeTime = (row.preDischargeTime ?? '').slice(0, 5);
    this.reason = '';
    this.loadAudit(row.encounterId);
  }

  cancel(): void {
    this.selected.set(null);
    this.auditEntries.set([]);
  }

  save(): void {
    const row = this.selected();
    if (!row) {
      return;
    }
    if (!this.dischargeDate || !this.preDischargeDate || !this.preDischargeTime) {
      this.errorMessage.set('Sila lengkapkan Discharge Date & Time, Pre Discharge Date dan Pre Discharge Time.');
      return;
    }
    if (!window.confirm(`Kemaskini tarikh discaj untuk ${row.patientMrn} (encounter ${row.encounterId})?`)) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post<DischargeEncounterRow>(`${API_BASE_URL}/discharge-date/encounters`, {
      encounterId: row.encounterId,
      dischargeDate: this.dischargeDate,
      preDischargeDate: this.preDischargeDate,
      preDischargeTime: this.preDischargeTime,
      reason: this.reason
    }).subscribe({
      next: (updated) => {
        const merged = { ...row, ...updated, personName: row.personName, personNewIc: row.personNewIc };
        this.rows.set(this.rows().map((item) => item.encounterId === merged.encounterId ? merged : item));
        this.selected.set(merged);
        this.reason = '';
        this.isSaving.set(false);
        this.successMessage.set('Tarikh discaj berjaya dikemaskini.');
        this.loadAudit(merged.encounterId);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to update discharge date.');
      }
    });
  }

  private loadAudit(encounterId: string): void {
    const params = new HttpParams().set('encounterId', encounterId);
    this.http.get<DischargeDateAuditEntry[]>(`${API_BASE_URL}/discharge-date/audit`, { params }).subscribe({
      next: (entries) => this.auditEntries.set(entries),
      error: () => this.auditEntries.set([])
    });
  }

  // 'YYYY-MM-DD[ HH:mm:ss]' -> 'DD-MM-YYYY[ HH:mm:ss]' for display; '-' when empty
  fmt(value: string | null): string {
    if (!value) {
      return '-';
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})(.*)$/.exec(value);
    return match ? `${match[3]}-${match[2]}-${match[1]}${match[4]}` : value;
  }

  // 'YYYY-MM-DD HH:mm:ss' -> 'YYYY-MM-DDTHH:mm' for <input type="datetime-local">
  private dateTimeLocal(value: string | null): string {
    return value ? value.slice(0, 16).replace(' ', 'T') : '';
  }

  private datePart(value: string | null): string {
    return value ? value.slice(0, 10) : '';
  }
}
