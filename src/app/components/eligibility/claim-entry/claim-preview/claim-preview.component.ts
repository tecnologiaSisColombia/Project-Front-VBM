import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

interface Field {
  label: string;
  value: any;
  type?: string;
}

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
  styleUrls: ['./claim-preview.component.css']
})
export class ClaimPreviewComponent implements OnInit, OnChanges {
  @Input() claimData: any;
  @Input() rows: any[] = [];
  @Input() isPreviewVisible: boolean = false;
  @Input() selectedDiagnosis: { code: any; description: any }[] = [];
  @Input() accountFields!: { id: string, label: string, value?: any }[];
  @Output() closePreviewEvent = new EventEmitter<void>();
  claimFields: Field[] = [];
  accountFieldsRows: Field[] = [];

  ngOnInit(): void {
    this.buildFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accountFields']) {
      this.buildFields();
    }
  }

  private buildFields(): void {
    const observation = this.getAccountFieldValue('observations');
    const auth = this.getAccountFieldValue('auth');
    const totalCharge = this.getAccountFieldValue('charge');
    const paid = this.getAccountFieldValue('paid');

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
      { label: "19. Reserved For Local Use", value: observation },
      { label: "21. Diagnosis or Nature Of Illness Or Injury", type: "list", value: this.selectedDiagnosis },
      { label: "Prior Auth#", value: auth }
    ];

    this.accountFieldsRows = [
      { label: "Total charge", value: totalCharge },
      { label: "Paid", value: paid },
      { label: "Balance due", value: '' },
      { label: "32. Facility address", value: '' },
      { label: "33. Billing address", value: this.claimData?.address_supplier }
    ];
  }

  private getAccountFieldValue(id: string): any {
    return this.accountFields?.find(field => field.id === id)?.value;
  }

  closePreview(): void {
    this.closePreviewEvent.emit();
  }

  getOrdinalSuffix(index: number): string {
    const j = index % 10, k = index % 100;
    if (j === 1 && k !== 11) {
      return index + 'st';
    }
    if (j === 2 && k !== 12) {
      return index + 'nd';
    }
    if (j === 3 && k !== 13) {
      return index + 'rd';
    }
    return index + 'th';
  }
}
