import { CommonModule } from '@angular/common';
import { Component, SimpleChanges, Input } from '@angular/core';
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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocationService } from 'app/services/config/location.service';
import { LocalityService } from 'app/services/config/localities.service';
import { DoctorService } from 'app/services/config/doctors.service';
import { DiagnosisService } from 'app/services/config/diagnosis.service';
import { ModifiersService } from 'app/services/config/modifiers.service';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';
import { ServicesService } from 'app/services/config/services.service';
import { ProductsService } from 'app/services/config/products.service';
import { forkJoin, map, catchError } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-claim-entry',
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
  styleUrls: ['./claim-entry.component.css']
})
export class ClaimEntryComponent {
  @Input() claimData: any;
  modifiersOptions: { label: string; value: number }[] = [];
  placeServicesOptions: { label: string; value: number }[] = [];
  diagnosisOptions: { label: string; value: number }[] = [];
  localities: any[] = [];
  doctors: any[] = [];
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
    { label: "CHAMPVA", value: 4 },
    { label: "GROUP HEALTH PLAN", value: 5 },
    { label: "FECA", value: 6 },
    { label: "OTHER", value: 7 },
  ];
  diagnosisPointerOptionsCache: { value: number; label: string }[] = [];
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
    private doctorService: DoctorService,
    private fb: UntypedFormBuilder,
  ) {
    this.form = this.fb.group({
      insurance_type: [7, [Validators.required]],
      insured_id: [null, [Validators.required]],
      patient_name: [null, [Validators.required]],
      patient_birth_date: [null, [Validators.required]],
      patient_gender: [null, [Validators.required]],
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
      ], { validators: this.diagValidatorForm }),
      federal_tax_id: [null, [Validators.required]],
      ssn_ein: [2, [Validators.required]],
      patient_account_number: [null],
      total_charge: [null, [Validators.required]],
      signature_doctor: [1, [Validators.required]],
      date_signature_doctor: [null, [Validators.required]],
      service_facility_location: [null, [Validators.required]],
      service_facility_npi: [null, [Validators.required]],
      billing_provider_phone: [null, [Validators.required]],
      billing_provider_npi: [null, [Validators.required]],
      billing_provider_address: [null, [Validators.required]],
      amount_paid: [0, [Validators.required]],
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
    this.getDoctors();

    const rows = this.form.get('rows') as FormArray;

    const dateInitialControl = rows.at(0).get('date_initial');

    const dateFinalControl = rows.at(0).get('date_final');

    dateInitialControl?.valueChanges.subscribe((newInitialDate: Date) => {
      const currentFinalDate = dateFinalControl?.value;
      if (currentFinalDate && newInitialDate) {
        const today = new Date().setHours(0, 0, 0, 0);
        const newInitial = new Date(newInitialDate).setHours(0, 0, 0, 0);
        const final = new Date(currentFinalDate).setHours(0, 0, 0, 0);

        if (final !== today && final <= newInitial) dateFinalControl?.reset();
      }
      dateFinalControl?.updateValueAndValidity();
    });

    this.form.get('diagnosis')?.valueChanges.subscribe(() => {
      this.diagPointerOptions();
    });

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

  get rowsControls(): UntypedFormArray {
    return this.form.get('rows') as UntypedFormArray;
  }

  get diagnosisControls(): UntypedFormArray {
    return this.form.get('diagnosis') as UntypedFormArray;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['claimData'] && this.claimData) {
      this.form.patchValue({
        insured_id: this.claimData.primary_subscriber_id,
        patient_name: this.claimData.patient_name,
        patient_birth_date: this.claimData.patient_birthDate,
        patient_gender: this.claimData.patient_gender,
        patient_address: this.claimData.patient_address,
        patient_city: this.claimData.patient_city,
        patient_state: this.claimData.patient_state,
        patient_zip_code: this.claimData.patient_postal_code,
        patient_phone: this.claimData.patient_phone,
        insured_police_group_feca: this.claimData.group,
        insured_date_birth: this.claimData.patient_birthDate,
        insured_gender: this.claimData.patient_gender,
        insured_insurance_plan_name: this.claimData.insured_insurance_plan_name,
        billing_provider_phone: this.claimData.provider_data.user.phone,
        billing_provider_npi: this.claimData.provider_data.npi,
        billing_provider_address: this.claimData.provider_data.address,
        federal_tax_id: this.claimData.provider_data.federal_tax_id,
      });

      (this.rowsControls.controls as UntypedFormGroup[]).forEach((rowGroup) => {
        rowGroup.patchValue({ rendering_provider_id: this.claimData.provider_data.npi });
      });
    }
  }

  isModifierDisabled(rowCtrl: AbstractControl, index: number): boolean {
    if (index === 0) return false;
    const modifiers = rowCtrl.get('modifiers') as FormArray;
    const prev = modifiers.at(index - 1).get('value')?.value;
    if (!prev) return true;
    return index >= 2 && prev === modifiers.at(index - 2).get('value')?.value;
  }

  diagPointerOptions(): void {
    this.diagnosisPointerOptionsCache = this.diagnosisControls.controls
      .map((control, index) => {
        if (control.value) {
          return { value: index + 1, label: (index + 1).toString() };
        }
        return null;
      })
      .filter(option => option !== null) as { value: number; label: string }[];
  }

  getDiagnosisCode(pointer: number): string | null {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    const diagnosisControl = diagnosisArray.at(pointer - 1);
    return diagnosisControl ? diagnosisControl.value : null;
  }

  diagValidatorForm(formArray: AbstractControl): { [key: string]: boolean } | null {
    if (!(formArray instanceof FormArray)) return null;
    const values = formArray.controls.map(c => c.value).filter(v => v !== null && v !== '');
    return values.length === new Set(values).size ? null : { duplicateDiagnosis: true };
  }

  onModifierChange(rowCtrl: AbstractControl): void {
    const modifiersArray = rowCtrl.get('modifiers') as FormArray;
    modifiersArray.markAllAsTouched();
    modifiersArray.updateValueAndValidity({ emitEvent: true });
  }

  getModifiersControls(rowCtrl: AbstractControl): AbstractControl[] {
    return (rowCtrl.get('modifiers') as UntypedFormArray).controls;
  }

  searchCodes(): void {
    forkJoin([
      this.productService.get(
        { payer_id: this.claimData?.insurer_data.payer_id, active: 1 }, null, null, true).pipe(
          map((res: any) => Array.isArray(res) ? res : [])
        ),
      this.serviceService.get(
        { payer_id: this.claimData?.insurer_data.payer_id, active: 1 }, null, null, true).pipe(
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

  disabledDate = (current: Date): boolean => {
    return current > new Date();
  };

  disabledFinalDateCpts = (current: Date): boolean => {
    const initialDate = this.form.get('rows')?.value[0]?.date_initial;
    if (!initialDate) return true;
    const today = new Date().setHours(0, 0, 0, 0);
    const currentDate = new Date(current).setHours(0, 0, 0, 0);
    const initialDateOnly = new Date(initialDate).setHours(0, 0, 0, 0);
    return currentDate !== today && (currentDate > today || currentDate < initialDateOnly);
  };

  getModifiers(): void {
    this.modifiersService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        const modifiers: any[] = res;
        this.modifiersOptions = modifiers.map((d) => ({
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
    this.locationService.get({ active: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          const locations: any[] = res;
          this.placeServicesOptions = locations.map((d) => ({
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
    this.diagnosisService.get({ active: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          const diagnosis: any[] = res;
          this.diagnosisOptions = diagnosis.map((d) => ({
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
    this.localityService.get({ active: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          this.localities = res;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  getDoctors(): void {
    this.doctorService.get({ active: 1 }, null, null, true)
      .subscribe({
        next: (res: any) => {
          this.doctors = res;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  onProcedureSelected(selectedCode: string, row: AbstractControl): void {
    row.get('charges')?.setValue(this.codeOptions.find(o => o.value === selectedCode)?.charge ?? null);
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
        rowValue.modifiers.map((mod: any, index: number) => index === 0
          ? this.fb.group({ id: mod.id, value: [mod.value, Validators.required] })
          : this.fb.group({ id: mod.id, value: [mod.value] })
        ), { validators: this.modifiersValidator }
      ),
      diagnosis_pointer: [rowValue.diagnosis_pointer, Validators.required],
      charges: [rowValue.charges, Validators.required],
      units: [rowValue.units, Validators.required],
      rendering_provider_id: [rowValue.rendering_provider_id, Validators.required]
    });

    this.rowsControls.push(newRow);
    this.calculateTotalCharges()
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
        this.fb.group({ id: [2], value: [''] }),
        this.fb.group({ id: [3], value: [''] }),
        this.fb.group({ id: [4], value: [''] }),
      ], { validators: this.modifiersValidator }),
      diagnosis_pointer: ['', Validators.required],
      charges: [null, Validators.required],
      units: [null, Validators.required],
      rendering_provider_id: [this.claimData?.provider_data.npi, Validators.required],
    });
  }

  modifiersValidator(control: AbstractControl) {
    if (!(control instanceof FormArray)) return null;
    const values = control.controls.map(c => c.get('value')?.value).filter(v => v != null && v !== '');
    return values.length === new Set(values).size ? null : { duplicateModifier: true };
  }

  updateDiagPointersCpts(): void {
    const validOptions: number[] = [];

    for (let i = 0; i < this.diagnosisControls.controls.length; i++) {
      const control = this.diagnosisControls.controls[i];

      if (control.value) {
        validOptions.push(i + 1);
      }
    }

    for (const row of this.rowsControls.controls) {
      const diagnosisPointerControl = row.get('diagnosis_pointer');

      const currentValue = diagnosisPointerControl?.value;

      if (currentValue && validOptions.indexOf(currentValue) === -1) {
        diagnosisPointerControl.setValue(null);
      }
    }
  }

  removeDiag(index: number): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    index > 0 && (diagnosisArray.removeAt(index), this.updateDiagPointersCpts());
  }

  addDiag(): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    diagnosisArray.length < 12 && diagnosisArray.push(new FormControl(null));
  }

  resetRow(i: number): void {
    this.rowsControls.setControl(i, this.createRow());
    this.calculateTotalCharges()
  }

  addRow(): void {
    this.rowsControls.push(this.createRow());
  }

  deleteRow(i: number): void {
    if (this.rowsControls.length > 1) this.rowsControls.removeAt(i);
    this.calculateTotalCharges()
  }

  calculateTotalCharges(): void {
    this.form.get('total_charge')?.setValue(
      this.rowsControls.controls.reduce((acc: number, control: AbstractControl) => {
        const charge = (control as UntypedFormGroup).get('charges')?.value;
        return acc + (charge ? Number(charge) : 0);
      }, 0)
    );
  }

  submit(): void {
    this.modalLoader = true;

    const f = { ...this.form.value };

    const payload = {
      patient: this.claimData.patient_id,
      diagnosis: f.diagnosis ? f.diagnosis.filter((d: any) => d) : [],
      cpts: f.rows.map((row: any) => ({
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
      insurance_type: f.insurance_type,
      relationship: f.relationship,
      insured_date_birth: f.insured_date_birth,
      insured_gender: ({ M: 1, F: 2 } as Record<string, number>)[f.insured_gender],
      insured_insurance_plan_name: f.insured_insurance_plan_name,
      patient_signature: f.patient_signature,
      date_service: f.date_service,
      insured_signature: f.insured_signature,
      name_referring_provider: f.name_referring_provider,
      name_referring_provider_npi: f.name_referring_provider_npi,
      original_ref_number: f.original_ref_number,
      prior_authorization_number: f.prior_authorization_number,
      federal_tax_id: f.federal_tax_id,
      ssn_ein: f.ssn_ein,
      patient_account_number: f.patient_account_number,
      total_charge: f.total_charge,
      amount_paid: f.amount_paid,
      signature_doctor: f.signature_doctor,
      date_signature_doctor: f.date_signature_doctor,
      service_facility_location: f.service_facility_location,
      service_facility_npi: f.service_facility_npi,
      billing_provider_phone: f.billing_provider_phone,
      billing_provider_npi: f.billing_provider_npi,
      billing_provider_address: f.billing_provider_address,
      accept_assignment: 1,
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
    };

    this.eligibilityService.createClaim(payload)
      .pipe(finalize(() => {
        this.modalLoader = false;
      }))
      .subscribe({
        next: (res) => {
          this.msgService.success(JSON.stringify(res));
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

  validateRepeated(
    control: AbstractControl,
    parent: AbstractControl,
    arrayName: string,
    valueKey?: string
  ): string {
    const formArray = parent.get(arrayName) as FormArray;
    const value = valueKey ? control.get(valueKey)?.value : control.value;

    if (!value) {
      return '';
    }

    const repeatedControls = formArray.controls.filter(c => {
      const currentValue = valueKey ? c.get(valueKey)?.value : c.value;
      return currentValue === value;
    });

    return repeatedControls.length > 1 ? 'error' : '';
  }

  hasFeedback(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control?.invalid && (control.dirty || control.touched) ? true : false;
  }

}
