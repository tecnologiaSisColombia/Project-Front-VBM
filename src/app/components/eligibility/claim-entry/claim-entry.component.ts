import { CommonModule } from '@angular/common';
import { Input, ViewChild, ElementRef } from '@angular/core';
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
import { DoctorService } from 'app/services/config/doctors.service';
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
  @Input() claimDataView: any;
  modifiersOptions: { label: string; value: number }[] = [];
  modifiersInput: any[] = [];
  totalCharges = 0;
  locations: any[] = [];
  placeServicesOptions: { label: string; value: number }[] = [];
  diagnosisOptions: { label: string; value: number }[] = [];
  diagnosis: any[] = [];
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
    { label: "CHAMPVA", value: 5 },
    { label: "GROUP HEALTH PLAN", value: 5 },
    { label: "FECA", value: 6 },
    { label: "OTHER", value: 7 },
  ];
  diagnosisPointerOptionsCache: { value: number; label: string }[] = [];
  form: UntypedFormGroup;
  @ViewChild('childContent', { static: false }) childContent!: ElementRef;

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
      ]),
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
      this.updateDiagnosisPointerOptions();
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

    } else if (changes['claimDataView'] && this.claimDataView) {
      if (Array.isArray(this.claimDataView.dx)) {
        const dxArray = this.form.get('diagnosis') as FormArray;
        dxArray.clear();

        this.claimDataView.dx.forEach((diagObj: { dx: string }, index: number) => {
          const validators = index === 0 ? [Validators.required] : [];
          dxArray.push(new FormControl(diagObj.dx, validators));
        });
      }

      if (Array.isArray(this.claimDataView.cpts)) {
        const rowsFormArray = this.form.get('rows') as FormArray;

        rowsFormArray.clear();

        this.claimDataView.cpts.forEach((cptObj: any) => {
          const rowGroup = this.fb.group({
            date_initial: [cptObj.date_initial],
            date_final: [cptObj.date_final],
            place_of_service: [cptObj.place_of_service],
            emg: [cptObj.emg?.toString()],
            procedures: [cptObj.service ?? cptObj.products],
            modifiers: this.fb.array([
              this.fb.group({ id: [1], value: [cptObj.modifier_1] }),
              this.fb.group({ id: [2], value: [cptObj.modifier_2] }),
              this.fb.group({ id: [3], value: [cptObj.modifier_3] }),
              this.fb.group({ id: [4], value: [cptObj.modifier_4] })
            ]),
            diagnosis_pointer: [cptObj.diagnosis_pointer],
            charges: [cptObj.charges],
            units: [cptObj.days_or_unit],
            rendering_provider_id: [cptObj.rendering_provider_id]
          });

          rowsFormArray.push(rowGroup);
        });
      }
      this.form.patchValue({
        insured_id: this.claimDataView.patient_data.primary_subscriber_id,
        patient_name: `${this.claimDataView.patient_data.last_name} ${this.claimDataView.patient_data.first_name}`,
        patient_address: this.claimDataView.patient_data.primary_address,
        patient_birth_date: this.claimDataView.patient_data.birth_date,
        patient_gender: this.claimDataView.patient_data.gender,
        patient_city: this.claimDataView.patient_data.city,
        patient_state: this.claimDataView.patient_data.state,
        patient_zip_code: this.claimDataView.patient_data.postal_code,
        patient_phone: this.claimDataView.patient_data.primary_phone,
        insured_date_birth: this.claimDataView.patient_data.birth_date,
        insured_gender: this.claimDataView.patient_data.gender,
        insured_police_group_feca: this.claimDataView.patient_data.primary_group_number,
        insured_insurance_plan_name: this.claimDataView.patient_data.primary_insure_plan_name,
        name_referring_provider: this.claimDataView.name_referring_provider,
        name_referring_provider_npi: this.claimDataView.name_referring_provider_npi,
        original_ref_number: this.claimDataView.original_ref_number,
        prior_authorization_number: this.claimDataView.prior_authorization_number,
        federal_tax_id: this.claimDataView.federal_tax_id,
        date_signature_doctor: this.claimDataView.date_signature_doctor,
        service_facility_location: this.claimDataView.service_facility_location,
        service_facility_npi: this.claimDataView.service_facility_npi,
        amount_paid: this.claimDataView.amount_paid,
        date_service: this.claimDataView.date_service,
        total_charge: this.claimDataView.total_charge,
        patient_account_number: this.claimDataView.patient_account_number,
        signature_doctor: this.claimDataView.signature_doctor,
        ssn_ein: this.claimDataView.ssn_ein,
        billing_provider_phone: this.claimDataView.provider_data.user.phone,
        billing_provider_address: this.claimDataView.provider_data.address,
        billing_provider_npi: this.claimDataView.provider_data.npi,
      });
    }
  }

  get isViewMode(): boolean {
    return !!this.claimDataView;
  }

  get rowsControls(): UntypedFormArray {
    return this.form.get('rows') as UntypedFormArray;
  }

  get diagnosisControls(): UntypedFormArray {
    return this.form.get('diagnosis') as UntypedFormArray;
  }

  updateDiagnosisPointerOptions(): void {
    this.diagnosisPointerOptionsCache = this.diagnosisControls.controls
      .map((control, index) => {
        if (control.value) {
          return { value: index + 1, label: (index + 1).toString() };
        }
        return null;
      })
      .filter(option => option !== null) as { value: number; label: string }[];
  }

  getSsnEinLabel(value: any): string {
    const option = this.ssnEinOptions.find(o => o.value === value);
    return option ? option.label : value;
  }

  getEmgLabel(value: any): string {
    switch (value) {
      case '1':
      case 1:
        return 'YES';
      case '2':
      case 2:
        return 'NO';
      default:
        return value;
    }
  }

  getDiagnosisLabel(value: any): string {
    const option = this.diagnosisOptions.find(o => o.value === value);
    return option ? option.label : value;
  }

  getModifierLabel(value: any): string {
    const option = this.modifiersOptions.find(o => o.value === value);
    return option ? option.label : value;
  }

  getSignatureDoctorLabel(value: any): string {
    const option = this.signatureOptions.find(o => o.value === value);
    return option ? option.label : value;
  }

  getDiagnosisStatus(control: AbstractControl): string {
    const diagnosisArray = this.form.get('diagnosis') as FormArray;
    const occurrences = diagnosisArray.controls.filter(c => c.value && c.value === control.value).length;
    return occurrences > 1 ? 'error' : '';
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
        this.fb.group({ id: [2], value: [''] }),
        this.fb.group({ id: [3], value: [''] }),
        this.fb.group({ id: [4], value: [''] }),
      ],),
      diagnosis_pointer: ['', Validators.required],
      charges: [null, Validators.required],
      units: [null, Validators.required],
      rendering_provider_id: [this.claimData?.provider_data.npi ?? null, Validators.required],
    });
  }

  uniqueModifiersValidator(formArray: AbstractControl) {
    if (!(formArray instanceof FormArray)) return null;

    const values: string[] = formArray.controls
      .map((control) => control.get('value')?.value)
      .filter((val) => val !== null && val !== '');

    const uniqueValues = new Set(values);

    return values.length === uniqueValues.size ? null : { duplicateModifier: true };
  }

  getModifierStatus(row: AbstractControl, modCtrl: AbstractControl): string {
    const modifiersArray = row.get('modifiers') as FormArray;
    const modValue = modCtrl.get('value')?.value;
    // Si el valor está vacío, no mostramos error
    if (!modValue) {
      return '';
    }
    const occurrences = modifiersArray.controls.filter(c => {
      return c.get('value')?.value === modValue;
    }).length;
    return occurrences > 1 ? 'error' : '';
  }

  onModifierChange(rowCtrl: AbstractControl): void {
    const modifiersArray = rowCtrl.get('modifiers') as FormArray;

    modifiersArray.markAllAsTouched();
    modifiersArray.updateValueAndValidity({ emitEvent: true });
  }

  getModifiersControls(rowCtrl: AbstractControl): AbstractControl[] {
    return (rowCtrl.get('modifiers') as UntypedFormArray).controls;
  }

  addRow(): void {
    this.rowsControls.push(this.createRow());
  }

  disabledDate = (current: Date): boolean => {
    return current > new Date();
  };

  disabledFinalDate = (current: Date): boolean => {
    const initialDate = this.form.get('rows')?.value[0]?.date_initial;
    if (!initialDate) return true;

    const today = new Date().setHours(0, 0, 0, 0);
    const currentDate = new Date(current).setHours(0, 0, 0, 0);
    const initialDateOnly = new Date(initialDate).setHours(0, 0, 0, 0);

    return currentDate !== today && (currentDate > today || currentDate < initialDateOnly);
  };

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
        this.localities = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getDoctors(): void {
    this.doctorService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        this.doctors = res;
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
        rowValue.modifiers.map((mod: any, index: number) =>
          index === 0
            ? this.fb.group({ id: mod.id, value: [mod.value, Validators.required] })
            : this.fb.group({ id: mod.id, value: [mod.value] })
        ),
        { validators: this.uniqueModifiersValidator }
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
    if (diagnosisArray.length < 12) {
      diagnosisArray.push(new FormControl(null));
    }
  }

  removeDiagnosis(index: number): void {
    const diagnosisArray = this.form.get('diagnosis') as UntypedFormArray;
    if (index > 0) {
      diagnosisArray.removeAt(index);
      this.updateDiagnosisPointerOptions();
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

  hasFeedback(controlName: string): 'success' | 'error' | '' {
    const control = this.form.get(controlName);
    if (!control) return '';
    if (control.valid && (control.dirty || control.touched)) return 'success';
    return control.invalid ? 'error' : '';
  }

  getChildContent(): ElementRef {
    return this.childContent;
  }
}
