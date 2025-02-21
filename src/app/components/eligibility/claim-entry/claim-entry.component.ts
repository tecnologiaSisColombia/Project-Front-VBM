import { CommonModule } from '@angular/common';
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
import { Component, SimpleChanges } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormArray,
  AbstractControl,
} from '@angular/forms';
import { FormControl } from '@angular/forms';
import { LocationService } from 'app/services/config/location.service';
import { LocalityService } from 'app/services/config/localities.service';
import { DiagnosisService } from 'app/services/config/diagnosis.service';
import { ModifiersService } from 'app/services/config/modifiers.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Input } from '@angular/core';
import { ServicesService } from 'app/services/config/services.service';
import { ProductsService } from 'app/services/config/products.service';
import { debounceTime, Subject } from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
    ReactiveFormsModule,
    NzDatePickerModule,
    NzTableModule,
    NzInputModule,
    NzSelectModule,
    FormsModule,
    NzSpinModule,
  ],
  templateUrl: './claim-entry.component.html',
  styleUrls: ['./claim-entry.component.css'],
})
export class ClaimEntryComponent {
  @Input() claimData!: {
    patient_name: string;
    patient_birthDate: string;
    patient_city: string;
    patient_state: string;
    patient_phone: string;
    patient_postal_code: string;
    patient_gender: string;
    patient_address: string;
    provider_city: string;
    provider_state: string;
    provider_postal_code: string;
    provider_phone: string;
    provider_address: string;
    provider_npi: string;
    plan_contract: string;
    provider_federal_tax_id: string;
    plan_name: string;
    group: string;
    auth: string;
    insured_name: string;
    insurer_address: string;
    modifiers: string;
    primary_subscriber_id: string;
    orderringNpi: string;
    referingNpi: string;
  };
  cptLoading = false;
  modifiersOptions: { label: string; value: number }[] = [];
  modifiersInput: any[] = [];
  totalCharges = 0;
  locations: any[] = [];
  diagnosisOptions: { label: string; value: number }[] = [];
  diagnosis: any[] = [];
  localities: any[] = [{ id: 'N/A', name: 'N/A' }];
  form: UntypedFormGroup;
  private searchCptSubject = new Subject<any>();

  constructor(
    private msgService: NzMessageService,
    private locationService: LocationService,
    private localityService: LocalityService,
    private diagnosisService: DiagnosisService,
    private modifiersService: ModifiersService,
    private serviceService: ServicesService,
    private productService: ProductsService,
    private fb: UntypedFormBuilder,
  ) {

    this.form = this.fb.group({
      insurance_type: [7, [Validators.required]],
      insured_id: [null, [Validators.required]],
      patient_name: [null, [Validators.required]],
      patient_birth_date: [null, [Validators.required]],
      patient_gender: [null, [Validators.required]],
      insured_name: [null, [Validators.required]],
      patient_address: [null, [Validators.required]],
      patient_city: [null, [Validators.required]],
      patient_state: [null, [Validators.required]],
      patient_zip_code: [null, [Validators.required]],
      patient_phone: [null, [Validators.required]],
      relationship: [1, [Validators.required]],
      // insured_address: [null, [Validators.required]],
      // insured_city: [null, [Validators.required]],
      // insured_state: [null, [Validators.required]],
      // insured_zip_code: [null, [Validators.required]],
      // insured_phone: [null, [Validators.required]],
      // other_insured_name: [null],
      // other_insured_name_policy_group: [null, [Validators.required]],
      // insurance_plan_name: [null, [Validators.required]],
      // employment: [null],
      // auto_accident: [null],
      // other_accident: [null],
      insured_police_group_feca: [null, [Validators.required]],
      insured_date_birth: [null, [Validators.required]],
      insured_gender: [null, [Validators.required]],
      insured_insurance_plan_name: [null, [Validators.required]],
      patient_signature: [1, [Validators.required]],
      date_service: [null, [Validators.required]],
      insured_signature: [1, [Validators.required]],
      name_referring_provider: [null],
      name_referring_provider_npi: [null],
      diagnosis: this.fb.array([
        new FormControl(null, Validators.required),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null)
      ]),
      federal_tax_id: [null, [Validators.required]],
      ssn_ein: [null, [Validators.required]],
      patient_account: [null],
      accept_assignment: [1, [Validators.required]],

      total_charge: [null, [Validators.required]],
      signature_doctor: [null, [Validators.required]],
      date_signature_doctor: [null, [Validators.required]],
      service_facility_location: [null, [Validators.required]],
      service_facility_npi: [null, [Validators.required]],
      billing_provider_phone: [null, [Validators.required]],
      billing_provider_npi: [null, [Validators.required]],
      billing_provider_address: [null, [Validators.required]],
      amount_paid: [null],
      rows: this.fb.array([this.createRow()]),

    });

    this.searchCptSubject
      .pipe(debounceTime(1000))
      .subscribe(({ search, row }: any) => {
        this.cptLoading = true;
        if (search.startsWith('V') || search.startsWith('v')) {
          this.productService.get({ code: search }, 1, 1, true).subscribe({
            next: (res: any) => {
              row.charges = res?.[0]?.value ?? msgService.info('Product not found');
              this.cptLoading = false;
            },
            error: (err) => {
              this.cptLoading = false;
              this.msgService.error(JSON.stringify(err.error));
            },
          });
        } else {
          this.serviceService.get({ code: search }, 1, 1, true).subscribe({
            next: (res: any) => {
              if (res.length > 0) {
                row.charges = res[0].value;
              } else {
                msgService.info('Service not found');
              }
              this.cptLoading = false;
            },
            error: (err) => {
              this.cptLoading = false;
              this.msgService.error(JSON.stringify(err.error));
            },
          });
        }
      });
  }

  ngOnInit(): void {
    this.getLocations();
    this.getLocalities();
    this.getDiagnosis();
    this.getModifiers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['claimData'] && this.claimData) {
      this.form.patchValue({
        insured_id: this.claimData.primary_subscriber_id,
        patient_name: this.claimData.patient_name,
        patient_birth_date: this.claimData.patient_birthDate,
        patient_gender: this.claimData.patient_gender,
        insured_name: this.claimData.insured_name,
        patient_address: this.claimData.patient_address,
        patient_city: this.claimData.patient_city,
        patient_state: this.claimData.patient_state,
        patient_zip_code: this.claimData.patient_postal_code,
        patient_phone: this.claimData.patient_phone,
        // insured_address: this.claimData.provider_address,
        // insured_city: this.claimData.provider_city,
        // insured_state: this.claimData.provider_state,
        // insured_zip_code: this.claimData.provider_postal_code,
        // insured_phone: this.claimData.provider_phone,
        // other_insured_name_policy_group: this.claimData.group,
        // insurance_plan_name: this.claimData.plan_name,
        insured_police_group_feca: this.claimData.group,
        insured_date_birth: this.claimData.patient_birthDate,
        insured_gender: this.claimData.patient_gender,
        insured_insurance_plan_name: this.claimData.plan_name,
        billing_provider_phone: this.claimData.provider_phone,
        billing_provider_npi: this.claimData.provider_npi,
        billing_provider_address: this.claimData.provider_address,

        federal_tax_id: this.claimData.provider_federal_tax_id,
      });

      (this.rowsControls.controls as UntypedFormGroup[]).forEach((rowGroup) => {
        rowGroup.patchValue({ rendering_provider_id: this.claimData.provider_npi });
      });
    }
  }

  get rowsControls(): UntypedFormArray {
    return this.form.get('rows') as UntypedFormArray;
  }

  get diagnosisControls(): UntypedFormArray {
    return this.form.get('diagnosis') as UntypedFormArray;
  }

  createRow(): UntypedFormGroup {
    return this.fb.group({
      date_initial: [null, Validators.required],
      date_final: [null, Validators.required],
      place_of_service: ['', Validators.required],
      emg: ['NO', Validators.required],
      procedures: ['', Validators.required],
      modifiers: this.fb.array([
        this.fb.group({ id: 1, value: [''] }),
        this.fb.group({ id: 2, value: [''] }),
        this.fb.group({ id: 3, value: [''] }),
        this.fb.group({ id: 4, value: [''] }),
      ]),
      diagnosis_pointer: ['', Validators.required],
      charges: [null, Validators.required],
      units: [null, Validators.required],
      rendering_provider_id: [this.claimData?.provider_npi ?? null, Validators.required],
    });
  }

  getModifiersControls(rowCtrl: AbstractControl): AbstractControl[] {
    return (rowCtrl.get('modifiers') as UntypedFormArray).controls;
  }

  addRow(): void {
    this.rowsControls.push(this.createRow());
  }

  searchProcedures(search: string, row: any) {
    if (search.length < 3) return;
    this.searchCptSubject.next({ search: search, row: row });
  }

  getModifiers(): void {
    this.modifiersService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        this.modifiersInput = res;
        this.modifiersOptions = this.modifiersInput.map((d) => ({
          value: d.code,
          label: `${d.code}`,
        }));
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
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

  getDiagnosis(): void {
    this.diagnosisService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        this.diagnosis = res;
        this.diagnosisOptions = this.diagnosis.map((d) => ({
          value: d.code,
          label: `${d.code}`,
        }));
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

  copyRow(i: number): void {
    const rowGroup = this.rowsControls.at(i) as UntypedFormGroup;
    const rowValue = rowGroup.getRawValue();
    const newRow = this.fb.group({
      date_initial: [rowValue.date_initial, Validators.required],
      date_final: [rowValue.date_final, Validators.required],
      place_of_service: [rowValue.place_of_service, Validators.required],
      emg: [rowValue.emg, Validators.required],
      procedures: [rowValue.procedures, Validators.required],
      modifiers: this.fb.array(
        rowValue.modifiers.map((mod: any) =>
          this.fb.group({
            id: mod.id,
            value: [mod.value]
          })
        )
      ),
      diagnosis_pointer: [rowValue.diagnosis_pointer, Validators.required],
      charges: [rowValue.charges, Validators.required],
      units: [rowValue.units, Validators.required],
      rendering_provider_id: [rowValue.rendering_provider_id, Validators.required]
    });

    this.rowsControls.push(newRow);
  }

  deleteRow(i: number): void {
    if (this.rowsControls.length > 1) {
      this.rowsControls.removeAt(i);
    }
  }

  resetRow(i: number): void {
    this.rowsControls.setControl(i, this.createRow());
  }

  addDiagnosis(): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    if (diagnosisArray.length < 12) {
      diagnosisArray.push(new FormControl(null));
    }
  }

  removeDiagnosis(index: number): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    if (index > 0) {
      diagnosisArray.removeAt(index);
    }
  }

  calculateTotalCharges(): void {

  }

}
