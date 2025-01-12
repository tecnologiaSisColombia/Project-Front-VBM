import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { LocationService } from 'app/services/config/location.service';
import { LocalityService } from 'app/services/config/localities.service';
import { DiagnosisService } from 'app/services/config/diagnosis.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Input } from '@angular/core';
import { last } from 'rxjs';

@Component({
    selector: 'app-claim-entry',
    standalone: true,
    imports: [
        NzBreadCrumbModule,
        CommonModule,
        NzCardModule,
        NzGridModule,
        NzDividerModule,
        NzModalModule,
        NzIconModule,
        NzButtonComponent,
        NzDatePickerModule,
        NzTableModule,
        NzInputModule,
        NzSelectModule,
        FormsModule
    ],
    templateUrl: './claim-entry.component.html',
    styleUrls: ['./claim-entry.component.css']
})
export class ClaimEntryComponent {
    @Input() patientName: string = '';
    @Input() serviceValidFrom: string = '';
    @Input() serviceValidThru: string = '';
    @Input() birthDate: string = '';
    @Input() addressPatient: string = '';

    locations: any[] = [];
    selectedLocation: any = null;
    localities: any[] = [{ id: 'N/A', name: 'N/A' }];
    selectedLocality: any = 'N/A';
    selectedMemberHave: any = 'no';
    diagnosis: any[] = [];
    selectedDiagnosis: { code: any; description: any }[] = [];
    diagnosisOptions: { label: string; value: number }[] = [];
    isPreviewVisible = false;
    accountFields = [
        { id: 'observations', label: 'Reserved for local use' },
        { id: 'p_account', label: 'Patient account:' },
        { id: 'auth', label: 'Auth:' },
        { id: 'charge', label: 'Total charge:' },
        { id: 'paid', label: 'Paid:' },
        { id: 'balance', label: 'Balance:' },
    ];
    memberHave: any[] = [
        { id: 'no', name: 'NO' },
        { id: 'yes', name: 'YES' }
    ];
    rows = [
        {
            dateInitial: null,
            dateFinal: null,
            tos: '',
            cpt: '',
            modifiers: [{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }],
            diagnosisPointer: '',
            charges: '',
            units: '',
        },
    ];

    constructor(
        private msgService: NzMessageService,
        private locationService: LocationService,
        private localityService: LocalityService,
        private diagnosisService: DiagnosisService
    ) {
    }

    ngOnInit(): void {
        this.getLocations();
        this.getLocalities();
        this.getDiagnosis();
        this.selectedDiagnosis = [
            { code: null, description: null },
            { code: null, description: null }
        ];
    }

    previewClaim(): void {
        this.isPreviewVisible = true;
    }

    closePreview(): void {
        this.isPreviewVisible = false;
    }

    getLocations(): void {
        this.locationService.get({}, null, null, true).subscribe({
            next: (res: any) => {
                this.locations = res;
            },
            error: (err) => {
                this.msgService.error(JSON.stringify(err.error));
            },
        });
    }

    getLocalities(): void {
        this.localityService.get({}, null, null, true).subscribe({
            next: (res: any) => {
                this.localities = [{ id: 'N/A', name: 'N/A' }, ...res];
            },
            error: (err) => {
                this.msgService.error(JSON.stringify(err.error));
            },
        });
    }

    getDiagnosis(): void {
        this.diagnosisService.get({}, null, null, true).subscribe({
            next: (res: any) => {
                this.diagnosis = res;
                this.diagnosisOptions = this.diagnosis.map(d => ({
                    value: d.code,
                    label: `${d.code} - ${d.description}`,
                }));
            },
            error: (err) => {
                this.msgService.error(JSON.stringify(err.error));
            },
        });
    }

    addDiagnosis(): void {
        if (this.selectedDiagnosis.length < 12) {
            this.selectedDiagnosis.push(
                {
                    code: this.selectedDiagnosis.length + 1,
                    description: null
                });
        } else {
            this.msgService.warning(JSON.stringify('You cannot add more than 12 diagnoses'));
        }
    }

    removeDiagnosis(index: number): void {
        if (this.selectedDiagnosis.length > 2) {
            this.selectedDiagnosis.splice(index, 1);
        } else {
            this.msgService.warning(JSON.stringify('You must have at least 2 diagnoses.'));
        }
    }

    getOrdinalSuffix(index: number): string {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const value = index % 100;
        return index + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
    }

    addRow(): void {
        const rowId = this.rows.length + 1;
        this.rows.push({
            dateInitial: null,
            dateFinal: null,
            tos: '',
            cpt: '',
            modifiers: [
                { id: rowId * 10 + 1, value: '' },
                { id: rowId * 10 + 2, value: '' },
                { id: rowId * 10 + 3, value: '' }
            ],
            diagnosisPointer: '',
            charges: '',
            units: '',
        });
    }

    deleteRow(index: number): void {
        if (this.rows.length > 1) {
            this.rows.splice(index, 1);
        } else {
            this.msgService.warning(JSON.stringify('You must have at least one row'));
        }
    }

    copyRow(index: number): void {
        const rowId = this.rows.length + 1;
        const copiedRow = { ...this.rows[index] };

        copiedRow.modifiers = this.rows[index].modifiers.map((modifier, modIndex) => ({
            id: rowId * 10 + modIndex + 1,
            value: modifier.value
        }));

        this.rows.push(copiedRow);
    }

    resetRow(index: number): void {
        this.rows[index] = {
            dateInitial: null,
            dateFinal: null,
            tos: '',
            cpt: '',
            modifiers: [{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }],
            diagnosisPointer: '',
            charges: '',
            units: '',
        };
    }

}