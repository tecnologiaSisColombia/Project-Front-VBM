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
import { ModifiersService } from 'app/services/config/modifiers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Input } from '@angular/core';

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
    @Input() orderringNpi: string = '';
    @Input() referingNpi: string = '';
    @Input() modifiers: string = '';
    @Input() auth: string = '';
    locations: any[] = [];
    selectedLocation: any = null;
    localities: any[] = [{ id: 'N/A', name: 'N/A' }];
    selectedLocality: any = 'N/A';
    selectedMemberHave: any = 'no';
    diagnosis: any[] = [];
    modifiersInput: any[] = [];
    selectedDiagnosis: { code: any; description: any }[] = [];
    diagnosisOptions: { label: string; value: number }[] = [];
    modifiersOptions: { label: string; value: number }[] = [];
    isPreviewVisible = false;
    accountFields = [
        { id: 'observations', label: 'Reserved for local use:' },
        { id: 'p_account', label: 'Patient account:' },
        { id: 'auth', label: 'Auth:' },
        { id: 'charge', label: 'Total charge:', value: 0 },
        { id: 'paid', label: 'Paid:', value: 0 },
        { id: 'balance', label: 'Balance:', value: 0 },
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
            charges: null,
            units: null,
            ordering_npi: null,
            refering_npi: null
        },
    ];

    constructor(
        private msgService: NzMessageService,
        private locationService: LocationService,
        private localityService: LocalityService,
        private diagnosisService: DiagnosisService,
        private modifiersService: ModifiersService
    ) {
    }

    ngOnInit(): void {
        this.getLocations();
        this.getLocalities();
        this.getDiagnosis();
        this.getModifiers();
        this.selectedDiagnosis = [
            { code: null, description: null },
            { code: null, description: null },
            { code: null, description: null },
            { code: null, description: null },
        ];
        console.log(this.auth)
    }

    onLocationChange(): void {
        if (this.selectedLocation) {
            this.rows.forEach(row => {
                row.tos = this.selectedLocation;
            });
        }
    }

    previewClaim(): void {
        for (const row of this.rows) {
            if (row.dateInitial && row.dateFinal && row.dateFinal < row.dateInitial) {
                this.msgService.warning(JSON.stringify('The final date cannot be earlier than the initial date'));
                return;
            }
        }
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

    getModifiers(): void {
        this.modifiersService.get({}, null, null, true).subscribe({
            next: (res: any) => {
                this.modifiersInput = res;
                this.modifiersOptions = this.modifiersInput.map(d => ({
                    value: d.code,
                    label: `${d.code}`,
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
        }
    }

    removeDiagnosis(index: number): void {
        if (this.selectedDiagnosis.length > 2) {
            this.selectedDiagnosis.splice(index, 1);
        }
    }

    getOrdinalSuffix(index: number): string {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const value = index % 100;
        return index + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
    }

    calculateTotalCharges(): void {
        const total = this.rows.reduce((sum, row) => sum + (row.charges || 0), 0);
        this.accountFields.find(field => field.id === 'charge')!.value = total;
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
            charges: null,
            units: null,
            ordering_npi: null,
            refering_npi: null
        });
    }

    deleteRow(index: number): void {
        if (this.rows.length > 1) {
            this.rows.splice(index, 1);
            this.calculateTotalCharges();
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

        this.calculateTotalCharges();
    }

    resetRow(index: number): void {
        this.rows[index] = {
            dateInitial: null,
            dateFinal: null,
            tos: '',
            cpt: '',
            modifiers: [{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }],
            diagnosisPointer: '',
            charges: null,
            units: null,
            ordering_npi: null,
            refering_npi: null
        };
        this.calculateTotalCharges();
    }
}