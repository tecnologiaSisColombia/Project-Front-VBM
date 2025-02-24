import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
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
  FormGroup,
  FormArray,
  FormControl
} from '@angular/forms';
import { LocationService } from 'app/services/config/location.service';
import { LocalityService } from 'app/services/config/localities.service';
import { DiagnosisService } from 'app/services/config/diagnosis.service';
import { ModifiersService } from 'app/services/config/modifiers.service';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ServicesService } from 'app/services/config/services.service';
import { ProductsService } from 'app/services/config/products.service';
import { forkJoin, map, catchError } from 'rxjs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { finalize } from 'rxjs/operators';

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
    NzFormModule
  ],
  templateUrl: './claim-entry.component.html',
  styleUrls: ['./claim-entry.component.css'],
})
export class ClaimEntryComponent {
  @Input() claimData: any;
  modifiersOptions: { label: string; value: number }[] = [];
  modifiersInput: any[] = [];
  totalCharges = 0;
  locations: any[] = [];
  placeServicesOptions: { label: string; value: number }[] = [];
  diagnosisOptions: { label: string; value: number }[] = [];
  diagnosis: any[] = [];
  localities: any[] = [{ id: 'N/A', name: 'N/A' }];
  codeOptions: { label: string; value: string; charge: number }[] = [];
  modalLoader = false;
  signatureOptions = [
    { label: "SOF (Signature On File)", value: 1 },
  ];
  ssnEinOptions = [
    { label: "SSN", value: 1 },
    { label: "EIN", value: 2 },
  ];
  insuranceTypeOptions = [
    { label: "MEDICARE", value: 1 },
    { label: "MEDICAID", value: 2 },
    { label: "TRICARE", value: 3 },
    { label: "CHAMPVA", value: 5 },
    { label: "GROUP HEALTH PLAN", value: 5 },
    { label: "FECA", value: 6 },
    { label: "OTHER", value: 7 },
  ];
  form: UntypedFormGroup;

  constructor(
    private msgService: NzMessageService,
    private locationService: LocationService,
    private localityService: LocalityService,
    private diagnosisService: DiagnosisService,
    private modifiersService: ModifiersService,
    private serviceService: ServicesService,
    private productService: ProductsService,
    private eligibilityService: EligibilityService,
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
      ssn_ein: [2, [Validators.required]],
      patient_account: [null],
      total_charge: [null, [Validators.required]],
      signature_doctor: [1, [Validators.required]],
      date_signature_doctor: [null, [Validators.required]],
      service_facility_location: [null, [Validators.required]],
      service_facility_npi: [null, [Validators.required]],
      billing_provider_phone: [null, [Validators.required]],
      billing_provider_npi: [null, [Validators.required]],
      billing_provider_address: [null, [Validators.required]],
      amount_paid: [null],
      original_ref_number: [null],
      prior_authorization_number: [null],
      rows: this.fb.array([this.createRow()]),
    });
  }

  ngOnInit(): void {
    this.getLocations();
    this.getLocalities();
    this.getDiagnosis();
    this.getModifiers();
    this.searchCodes();

    this.form.get('name_referring_provider')?.valueChanges.subscribe(value => {
      const npiControl = this.form.get('name_referring_provider_npi');
      if (value && value.trim() !== '') {
        npiControl?.setValidators([Validators.required]);
      } else {
        npiControl?.clearValidators();
      }
      npiControl?.updateValueAndValidity();
    });
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

  get diagnosisPointerOptions(): { value: number; label: string }[] {
    return this.diagnosisControls.controls
      .map((control, index) => control.value ?
        { value: index + 1, label: (index + 1).toString() } : null)
      .filter(option => option !== null) as { value: number; label: string }[];
  }

  getLabelOptions(value: any, options: { value: any; label: string }[]): string {
    return options.find(option => option.value === value)?.label || value;
  }

  getDiagnosisCode(pointer: number): string | null {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    const diagnosisControl = diagnosisArray.at(pointer - 1);
    return diagnosisControl ? diagnosisControl.value : null;
  }

  createRow(): UntypedFormGroup {
    return this.fb.group({
      date_initial: [null, Validators.required],
      date_final: [null, Validators.required],
      place_of_service: ['', Validators.required],
      emg: ['2', Validators.required],
      procedures: ['', Validators.required],
      modifiers: this.fb.array([
        this.fb.group({ id: [1], value: ['', Validators.required] }),
        this.fb.group({ id: [2], value: ['', Validators.required] }),
        this.fb.group({ id: [3], value: ['', Validators.required] }),
        this.fb.group({ id: [4], value: ['', Validators.required] }),
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

  updateDiagnosisPointers(): void {
    const validOptions = this.diagnosisControls.controls
      .map((control, index) => control.value ? index + 1 : null)
      .filter(val => val !== null) as number[];

    this.rowsControls.controls.forEach(row => {
      const currentValue = row.get('diagnosis_pointer')?.value;
      if (currentValue && !validOptions.includes(currentValue)) {
        row.get('diagnosis_pointer')?.setValue(null);
      }
    });
  }

  searchCodes(): void {
    forkJoin([
      this.productService.get({}, 1, 10, true).pipe(
        map((res: any) => Array.isArray(res) ? res : [])
      ),
      this.serviceService.get({}, 1, 10, true).pipe(
        map((res: any) => Array.isArray(res) ? res : [])
      )
    ])
      .pipe(
        map(([products, services]) => [
          ...products.map((p: any) => ({ label: p.code, value: p.code, charge: p.value })),
          ...services.map((s: any) => ({ label: s.code, value: s.code, charge: s.value }))
        ]),
        catchError((err) => {
          this.msgService.error(JSON.stringify(err.error));
          return [[]];
        })
      )
      .subscribe(options => this.codeOptions = options);
  }

  onProcedureSelected(selectedCode: string, row: AbstractControl): void {
    row.get('charges')?.setValue(this.codeOptions.find(o => o.value === selectedCode)?.charge ?? null);
  }

  getModifiers(): void {
    this.modifiersService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        this.modifiersInput = res;
        this.modifiersOptions = this.modifiersInput.map((d) => ({
          value: d.id,
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
        this.placeServicesOptions = this.locations.map((d) => ({
          value: d.id,
          label: `${d.code}`,
        }));
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
    this.calculateTotalCharges()
  }

  deleteRow(i: number): void {
    if (this.rowsControls.length > 1) this.rowsControls.removeAt(i);
    this.calculateTotalCharges()
  }

  resetRow(i: number): void {
    this.rowsControls.setControl(i, this.createRow());
    this.calculateTotalCharges()
  }

  addDiagnosis(): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    diagnosisArray.length < 12 && diagnosisArray.push(new FormControl(null));
  }

  removeDiagnosis(index: number): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    if (index > 0) {
      diagnosisArray.removeAt(index);
      this.updateDiagnosisPointers();
    }
  }

  calculateTotalCharges(): void {
    let total = 0;
    this.rowsControls.controls.forEach((control: AbstractControl) => {
      const row = control as UntypedFormGroup;
      const charge = row.get('charges')?.value;
      total += charge ? Number(charge) : 0;
    });
    this.form.get('total_charge')?.setValue(total);
  }

  submit(): void {
    this.modalLoader = true;

    const formValue = { ...this.form.value };

    const payload = {
      patient: this.claimData.patient_id,
      diagnosis: formValue.diagnosis ? formValue.diagnosis.filter((d: any) => d) : [],
      cpts: formValue.rows.map((row: any) => ({
        procedures: row.procedures,
        date_initial: row.date_initial,
        date_final: row.date_final,
        place_of_service: row.place_of_service,
        emg: row.emg,
        modifiers: row.modifiers ? row.modifiers.map((mod: any) => ({
          id: mod.value,
          value: mod.value
        })) : [],
        diagnosis_pointer: row.diagnosis_pointer,
        charges: row.charges,
        days_or_unit: row.units,
        rendering_provider_id: row.rendering_provider_id,
        dx: this.getDiagnosisCode(row.diagnosis_pointer)
      })),
      insurance_type: formValue.insurance_type,
      relationship: formValue.relationship,
      insured_address: null,
      insured_city: null,
      insured_state: null,
      insured_zip_code: null,
      insured_phone: null,
      other_insured_name: null,
      other_insured_name_policy_group: null,
      employment: null,
      auto_accident: null,
      other_accident: null,
      insured_date_birth: formValue.insured_date_birth,
      insured_gender: formValue.insured_gender === 'M' ? 1 : formValue.insured_gender === 'F' ? 2 : 3,
      insured_insurance_plan_name: formValue.insured_insurance_plan_name,
      patient_signature: formValue.patient_signature,
      date_service: formValue.date_service,
      insured_signature: formValue.insured_signature,
      name_referring_provider: formValue.name_referring_provider,
      name_referring_provider_npi: formValue.name_referring_provider_npi,
      original_ref_number: formValue.original_ref_number,
      prior_authorization_number: formValue.prior_authorization_number,
      federal_tax_id: formValue.federal_tax_id,
      ssn_ein: formValue.ssn_ein,
      patient_account_number: formValue.patient_account_number,
      accept_assignment: 1,
      total_charge: formValue.total_charge,
      amount_paid: formValue.amount_paid,
      signature_doctor: formValue.signature_doctor,
      date_signature_doctor: formValue.date_signature_doctor,
      service_facility_location: formValue.service_facility_location,
      service_facility_npi: formValue.service_facility_npi,
      billing_provider_phone: formValue.billing_provider_phone,
      billing_provider_npi: formValue.billing_provider_npi,
      billing_provider_address: formValue.billing_provider_address
    };

    this.eligibilityService.createClaim(payload)
      .pipe(finalize(() => {
        this.modalLoader = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('Claim created successfully');
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  markAllControlsAsDirty(control: AbstractControl): void {
    if (control instanceof FormControl) {
      control.markAsDirty();
      control.updateValueAndValidity();
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      Object.keys(control.controls).forEach(key => {
        this.markAllControlsAsDirty(control.get(key)!);
      });
    }
  }

  getErrorMessage(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;

    if (control.hasError('required')) return 'This field is required';

    if (control.hasError('pattern')) return 'This field cannot be empty';

    return null;
  }

  hasFeedback(controlName: string): 'success' | 'error' | '' {
    const control = this.form.get(controlName);
    if (!control) return '';
    if (control.valid && (control.dirty || control.touched)) return 'success';
    return control.invalid ? 'error' : '';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}-` +
      `${d.getDate().toString().padStart(2, '0')}-` +
      `${d.getFullYear()}`;
  }

}
