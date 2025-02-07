import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-claim-preview',
  standalone: true,
  imports: [
    CommonModule,
    NzDatePickerModule,
    NzTableModule,
    NzInputModule,
    NzSelectModule,
    NzCardModule,
    NzGridModule,
    NzDividerModule,
    NzModalModule
  ],
  templateUrl: './claim-preview.component.html',
  styleUrl: './claim-preview.component.css'
})
export class ClaimPreviewComponent {
  @Input() claimData: any;
  @Input() accountFields: any[] = [];
  @Input() rows: any[] = [];
  @Input() isPreviewVisible: boolean = false;
  @Input() selectedDiagnosis: { code: any; description: any }[] = [];
  @Output() closePreviewEvent = new EventEmitter<void>();
  claimFields: any[] = [];
  accountFieldsRows: any[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.claimFields = [
      { label: "2. Patient's Name", value: this.claimData?.patientName },
      { label: "3. Patient's BirthDate", value: this.claimData?.birthDate },
      { label: "4. Insured's Name", value: this.claimData?.insurer },
      { label: "5. Patient's Address", value: this.claimData?.addressPatient },
      { label: "7. Insured's Address", value: this.claimData?.address_insurer },
      { label: "City", value: this.claimData?.city_patient },
      { label: "State", value: this.claimData?.state_patient },
      { label: "City", value: this.claimData?.city_supplier },
      { label: "State", value: this.claimData?.state_supplier },
      { label: "Zip", value: this.claimData?.postal_code_patient },
      { label: "Phone", value: this.claimData?.phone_patient },
      { label: "Zip Code", value: this.claimData?.postal_code_supplier },
      { label: "Phone", value: this.claimData?.phone_supplier },
      { label: "11. Insured's Policy Group Or Feca #", value: this.claimData?.plan_contract },
      { label: "Insurance Plan / Program Name", value: `${this.claimData?.plan_name} - Group ${this.claimData?.group}` },
      { label: "19. Reserved For Local Use", value: `${this.getObservationValue()}` },
      {
        label: "21. Diagnosis or Nature Of Illness Or Injury",
        type: "list",
        value: this.selectedDiagnosis
      },
      { label: "Prior Auth#", value: this.claimData?.auth }
    ];

    this.accountFieldsRows = [
      { label: "Total charge", value: `$ ${this.getTotalCharge()}` },
      { label: "Paid", value: `$ ${this.getPaid()}` },
      { label: "Balance due", value: "" },
      { label: "32. Facility address", value: "" },
      { label: "33. Billing address", value: this.claimData?.address_supplier },
    ];
  }

  closePreview(): void {
    this.closePreviewEvent.emit();
  }

  getObservationValue(): string {
    const value = this.accountFields.find(field => field.id === 'observations')?.value;
    return value !== undefined && value !== null ? String(value) : '';
  }

  getOrdinalSuffix(index: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = index % 100;
    return index + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  getAuthValue(): string {
    const authField = this.accountFields.find(field => field.id === 'auth');
    return authField ? String(authField.value || '') : 'N/A';
  }

  getTotalCharge(): number {
    return this.accountFields.find(field => field.id === 'charge')?.value || 0;
  }

  getPaid(): number {
    return this.accountFields.find(field => field.id === 'paid')?.value || 0;
  }
}
