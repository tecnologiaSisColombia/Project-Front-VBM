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
  selectedDiagnosis: { code: any; description: any }[] = [];
  form: UntypedFormGroup;
  private searchCptSubject = new Subject<any>();


  // selectedLocation: any = null;
  // selectedLocality: any = 'N/A';
  // selectedMemberHave: any = 'no';
  // listOfCpt: any[] = [];
  // isPreviewVisible = false;
  // currentTime: string = '';
  // private updateTimeout: any;

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
      provider_phone: [null, [Validators.required]],
      provider_zip_code: [null, [Validators.required]],
      patient_phone: [null, [Validators.required]],
      patient_zip_code: [null, [Validators.required]],
      provider_state: [null, [Validators.required]],
      provider_city: [null, [Validators.required]],
      patient_state: [null, [Validators.required]],
      patient_city: [null, [Validators.required]],
      insured_address: [null, [Validators.required]],
      relationship: [1, [Validators.required]],
      patient_address: [null, [Validators.required]],
      insurance_type: [7, [Validators.required]],
      insured_id: [null, [Validators.required]],
      patient_name: [null, [Validators.required]],
      patient_birth_date: [null, [Validators.required]],
      gender: [null, [Validators.required]],
      insured_name: [null, [Validators.required]],
      policy_group: [null, [Validators.required]],
      plan_name: [null, [Validators.required]],
      insured_signature: [1, [Validators.required]],
      patient_signature: [1, [Validators.required]],
      date: [null, [Validators.required]],
      date_initial: [null, [Validators.required]],
      date_final: [null, [Validators.required]],
      place_of_service: [null, [Validators.required]],
      emg: [null, [Validators.required]],
      procedures: [null, [Validators.required]],
      diagnosis_pointer: [null, [Validators.required]],
      charges: [null, [Validators.required]],
      units: [null, [Validators.required]],
      rendering_id: [null, [Validators.required]],
      federal_tax_id: [null, [Validators.required]],
      ssn_ein: [null, [Validators.required]],
      modifiers: [null],
      refering_provider_npi: [null],
      other_accident: [null],
      auto_accident: [null],
      employment: [null],
      other_insured: [null],
      refering_provider: [null],
      rows: this.fb.array([this.createRow()]),
      diagnosis: this.fb.array([
        new FormControl(null, Validators.required),
        new FormControl(null),
        new FormControl(null),
        new FormControl(null)
      ])
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
              row.charges = res?.length ? res[0].value : msgService.info('Service not found');
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
    // this.updateCurrentTime();
    // this.selectedDiagnosis = [
    //   { code: null, description: null },
    //   { code: null, description: null },
    //   { code: null, description: null },
    //   { code: null, description: null },
    // ];


  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['claimData'] && this.claimData) {
      this.form.patchValue({
        provider_phone: this.claimData.provider_phone,
        provider_zip_code: this.claimData.provider_postal_code,
        patient_phone: this.claimData.patient_phone,
        patient_zip_code: this.claimData.patient_postal_code,
        provider_state: this.claimData.provider_state,
        provider_city: this.claimData.provider_city,
        patient_state: this.claimData.patient_state,
        patient_city: this.claimData.patient_city,
        insured_address: this.claimData.provider_address,
        patient_address: this.claimData.patient_address,
        insured_id: this.claimData.primary_subscriber_id,
        patient_name: this.claimData.patient_name,
        patient_birth_date: this.claimData.patient_birthDate,
        insured_name: this.claimData.insured_name,
        policy_group: this.claimData.group,
        plan_name: this.claimData.plan_name,
        federal_tax_id: this.claimData.provider_federal_tax_id,
      });

      (this.rowsControls.controls as UntypedFormGroup[]).forEach((rowGroup) => {
        rowGroup.patchValue({ rendering_id: this.claimData.provider_npi });
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
      rendering_id: [this.claimData?.provider_npi ?? null, Validators.required],
    });
  }

  getModifiersControls(rowCtrl: AbstractControl): AbstractControl[] {
    return (rowCtrl.get('modifiers') as UntypedFormArray).controls;
  }

  addRow(): void {
    this.rowsControls.push(this.createRow());
  }

  searchProcedures(search: string, row: any) {
    if (search.length < 4) return;
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
      rendering_id: [rowValue.rendering_id, Validators.required]
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
  


  // getOrdinalSuffix(index: number): string {
  //   const suffixes = ['th', 'st', 'nd', 'rd'];
  //   return (
  //     index +
  //     (suffixes[((index % 100) - 20) % 10] || suffixes[index % 100] || 'th')
  //   );
  // }




  calculateTotalCharges(): void {
    // this.totalCharges = this.rows.reduce((sum, row) => sum + +(row.charges ?? 0), 0);
    // this.calculateBalance();
  }



  // removeDiagnosis(index: number): void {
  //   if (this.selectedDiagnosis.length > 2) {
  //     this.selectedDiagnosis.splice(index, 1);
  //   }
  // }

  // onLocationChange(): void {
  //   if (this.selectedLocation) {
  //     this.rows.forEach((row) => {
  //       row.place_of_service = this.selectedLocation;
  //     });
  //   }
  // }

  // updateCurrentTime() {
  //   const now = new Date();
  //   this.currentTime = now.toLocaleString('en-US', { hour12: true });
  // }

  // updateFieldValue(index: number, value: any): void {
  //   clearTimeout(this.updateTimeout);

  //   this.accountFields[index].value = value;

  //   if (
  //     this.accountFields[index].id === 'charge' ||
  //     this.accountFields[index].id === 'paid'
  //   ) {
  //     this.calculateBalance();
  //   }

  //   this.updateTimeout = setTimeout(() => {
  //     this.accountFields = [...this.accountFields];
  //   }, 200);
  // }
}
