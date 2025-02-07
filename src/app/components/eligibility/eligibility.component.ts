import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { debounceTime, Subject } from 'rxjs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { MemberComponent } from './member/member.component';
import { PlanDetailsComponent } from './plan-details/plan-details.component';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';
import * as XLSX from 'xlsx';
import { ClaimEntryComponent } from "./claim-entry/claim-entry.component";
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { S3Service } from 'app/services/upload-s3/upload-s3.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-eligibility',
  standalone: true,
  imports: [
    NzBreadCrumbModule,
    NzFormModule,
    NzButtonComponent,
    NzTableModule,
    NzPaginationModule,
    NzDividerModule,
    NzInputModule,
    NzIconModule,
    NzDrawerModule,
    NzSpinModule,
    CommonModule,
    NzSwitchModule,
    NzSelectModule,
    FormsModule,
    NzModalModule,
    MemberComponent,
    PlanDetailsComponent,
    ClaimEntryComponent,
    NzEmptyModule,
    NzButtonModule
  ],
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.css', '/src/animations/styles.css']
})
export class EligibilityComponent {
  isDataLoading = false;
  exportLoader = false;
  uploading = false;
  isPrinting = false;
  isVisibleModalDetails = false;
  isVisibleModalMember = false;
  isVisibleModalClaim = false;
  isVisibleModalUpload = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  firstSearch: any = null;
  lastSearch: any = null;
  suscriberSearch: any = null;
  selectedFile: File | null = null;
  [key: string]: any;
  searchFields = [
    { placeholder: 'First Name...', model: 'firstSearch', key: 'first_name' },
    { placeholder: 'Last Name...', model: 'lastSearch', key: 'last_name' },
    { placeholder: 'Suscriber Id...', model: 'suscriberSearch', key: 'suscriber_id' },
  ];
  selectedClaim: any = {
    patientName: '',
    validFrom: '',
    validThru: '',
    birthDate: '',
    orderringNpi: '',
    referingNpi: '',
    auth: '',
    state_patient: '',
    phone_patient: '',
    phone_supplier: '',
    postal_code_patient: '',
    postal_code_supplier: '',
    address_supplier: '',
    group: '',
    plan_contract: '',
    insurer: '',
    city_patient: '',
    city_supplier: '',
    plan_name: '',
    address_insurer: '',
    state_supplier: '',
    modifiers: '',
    addressPatient: '',
    primaryPlanName: '',
    visualTestMedicare: '',
    visionElements: ''
  };
  private searchNameSubject = new Subject<{ type: string; value: string }>();
  @ViewChild(PlanDetailsComponent, { static: false }) planDetailsComponent!: PlanDetailsComponent;

  constructor(
    private msgService: NzMessageService,
    private eligibilityService: EligibilityService,
    private s3Service: S3Service
  ) {

    this.searchNameSubject.pipe(debounceTime(1000)).subscribe(({ type, value }) => {
      const fields = {
        first_name: () => (this.firstSearch = value),
        last_name: () => (this.lastSearch = value),
        suscriber_id: () => (this.suscriberSearch = value),
      };

      (fields as Record<string, () => void>)[type]?.();
      this.page = 1;
      this.getInitData();
      this.isDataLoading = false;
    });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  getInitData() {
    this.isDataLoading = true;
    this.eligibilityService
      .getPatients(
        {
          first_name: this.firstSearch,
          last_name: this.lastSearch,
          subscriber_id: this.suscriberSearch,
        },
        this.page,
        this.page_size
      )
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  eligibilityUpload(): void {
    if (!this.selectedFile) return;

    const insurerPayerId = this.dataToDisplay[0].insurer_data.payer_id;
    const insurerId = this.dataToDisplay[0].insurer_data.id;

    const formData = new FormData();

    formData.append('file', this.selectedFile);
    formData.append('payer_id', insurerPayerId);
    formData.append('insurer_id', insurerId);

    this.uploading = true;

    this.s3Service.uploadEligibility(formData)
      .pipe(finalize(() => {
        this.uploading = false;
      }))
      .subscribe({
        next: () => {
          this.msgService.success('File upload successfully');
          this.isVisibleModalUpload = false;
          this.selectedFile = null;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      if (fileType === 'application/zip' || fileName.endsWith('.zip')) {
        this.selectedFile = file;
      } else {
        this.msgService.warning('Only files with .zip extension');
        this.selectedFile = null;
      }
    } else {
      this.selectedFile = null;
    }
  }

  pageChange(event: number) {
    this.page = event;
    this.getInitData();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getInitData();
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  isWithinRange(effective: string, terminates: string): boolean {
    const now = new Date();
    return now >= new Date(effective) && now <= new Date(terminates);
  }

  cancelOkModalUpload(): void {
    this.isVisibleModalUpload = false;
    this.selectedFile = null;
    this.uploading = false;
  }

  openModalUpload(): void {
    this.isVisibleModalUpload = true;
    this.uploading = false;
  }

  cancelOkModalClaim(): void {
    this.isVisibleModalClaim = false;
  }

  cancelOkModalDetails(): void {
    this.isVisibleModalDetails = false;
  }

  CancelOkModalMember(): void {
    this.isVisibleModalMember = false;
  }

  openModalMember(): void {
    this.isVisibleModalMember = true;
  }

  openModalClaim(rowData: any): void {
    this.selectedClaim = {
      patientName: `${rowData?.last_name ?? ''} ${rowData?.first_name ?? ''}`,
      validFrom: rowData?.effective ?? '',
      validThru: rowData?.terminates ?? '',
      birthDate: rowData?.birth_date ?? '',
      city_patient: rowData?.city ?? '',
      state_patient: rowData?.state ?? '',
      phone_patient: rowData?.primary_phone ?? '',
      postal_code_patient: rowData?.postal_code ?? '',
      postal_code_supplier: rowData?.suppliers[0].postal_code ?? '',
      address_supplier: rowData?.suppliers[0].address ?? '',
      orderringNpi: rowData?.insurer_data?.orderring_npi ?? '',
      referingNpi: rowData?.insurer_data?.refering_npi ?? '',
      auth: rowData?.insurer_data?.auth ?? '',
      insurer: rowData?.insurer_data?.name ?? '',
      address_insurer: rowData?.insurer_data?.address ?? '',
      city_supplier: rowData?.suppliers[0].city ?? '',
      phone_supplier: rowData?.suppliers[0].phone ?? '',
      state_supplier: rowData?.suppliers[0].state ?? '',
      modifiers: rowData?.insurer_data?.modifiers ?? '',
      plan_name: rowData?.subplan_data?.plan_data.name ?? '',
      addressPatient: `${rowData?.primary_address ?? ''} ${rowData?.address_1 ?? ''}`.trim(),
      primaryPlanName: rowData?.primary_insure_plan_name ?? '',
      visualTestMedicare: rowData.subplan_data.visual_test_medicare ?? '',
      plan_contract: rowData.subplan_data.plan_contract ?? '',
      group: rowData.subplan_data.group ?? '',
      visionElements: rowData.subplan_data.vision_elements ?? ''
    };
    this.isVisibleModalClaim = true;
  }

  openModalDetails(rowData: any): void {
    this.selectedClaim = {
      patientName: `${rowData?.last_name ?? ''} ${rowData?.first_name ?? ''}`,
      primaryPlanName: rowData?.primary_insure_plan_name ?? '',
      visualTestMedicare: rowData.subplan_data.visual_test_medicare ?? '',
      visionElements: rowData.subplan_data.vision_elements ?? ''
    }
    this.isVisibleModalDetails = true;
  }

  printContentDetails() {
    const content = this.planDetailsComponent.getChildContent()?.nativeElement;

    if (!content) return;

    this.isPrinting = true;

    html2canvas(content, { scale: 4, logging: false, useCORS: true, backgroundColor: null })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight, '', 'FAST');
        pdf.save('details.pdf');
        this.msgService.success('Export completed successfully');
      })
      .catch(error => this.msgService.error(JSON.stringify(error)))
      .finally(() => {
        this.isPrinting = false;
      });
  }

  exportBenefits(): void {
    this.eligibilityService.getPatients({}, null, null, true)
      .pipe(finalize(() => {
        this.exportLoader = false;
      }))
      .subscribe({
        next: (res: any) => {
          if (res.length === 0) {
            this.msgService.warning('No data available to export');
            return;
          }

          this.exportLoader = true;

          const headers = {
            first_name: 'First Name',
            last_name: 'Last Name',
            gender: 'Gender',
            birth_date: 'BirthDate',
            age: 'Age',
            email: 'Email',
            occupation: 'Occupation',
            effective: 'Effective',
            terminates: 'Terminates',
            city: 'City',
            primary_phone: 'Phone'
          };

          const selectedColumns = Object.keys(
            headers
          ) as (keyof typeof headers)[];

          const filteredData = res.map((patient: any) => {
            const row: Record<string, any> = {};
            selectedColumns.forEach((key) => {
              row[headers[key]] = patient[key] != null ? patient[key] : '';
            });
            return row;
          });

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'patients');

          const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });

          const blob = new Blob([excelBuffer], {
            type: 'application/octet-stream',
          });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);

          link.setAttribute('href', url);
          link.setAttribute('download', 'Patients.xlsx');
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.msgService.success('Export completed successfully');
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }


  printContentMember(): void {

  }
}