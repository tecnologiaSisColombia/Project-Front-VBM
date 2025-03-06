import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { debounceTime, Subject, forkJoin } from 'rxjs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';
import { BillingService } from 'app/services/billing/billing.service';
import { ClaimFormPdfComponent } from 'app/components/claim-form-pdf/claim-form-pdf.component';
import { finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-billing',
  imports: [
    NzBreadCrumbModule,
    NzIconModule,
    NzInputModule,
    NzPaginationModule,
    NzSpinModule,
    NzSwitchModule,
    NzTableModule,
    NzButtonComponent,
    NzDividerModule,
    CommonModule,
    NzDrawerModule,
    NzFormModule,
    NzSelectModule,
    FormsModule,
    NzModalModule,
    NzEmptyModule,
    ClaimFormPdfComponent
  ],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css', '/src/animations/styles.css']
})
export class BillingComponent {
  isDataLoading = false;
  exportLoader = false;
  isVisibleModalViewClaim = false;
  showPdf: boolean = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  idClaimsSearch: any = null;
  suscriberSearch: any = null;
  originSearch: any = null;
  statusSearch: any = null;
  allChecked = false;
  selectedRows: any[] = [];
  selectedClaim: any = {};
  [key: string]: any;
  searchFields = [
    { placeholder: 'Id Claim...', model: 'idClaimsSearch', key: 'id_claim' },
    { placeholder: 'Suscriber ID...', model: 'suscriberSearch', key: 'suscriber_id' },
  ];
  private searchNameSubject = new Subject<{ type: string; value: string | number | null }>();

  constructor(
    private msgService: NzMessageService,
    private eligibilityService: EligibilityService,
    private billingService: BillingService
  ) {
    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe(({ type, value }) => {
        const fields = {
          id_claim: () => (this.idClaimsSearch = value),
          origin: () => (this.originSearch = value),
          status: () => (this.statusSearch = value),
          suscriber_id: () => (this.suscriberSearch = value)
        };
        (fields as Record<string, () => void>)[type]?.();
        this.page = 1;
        this.getClaim();
        this.isDataLoading = false;
      });

  }

  ngOnInit(): void {
    this.getClaim()
  }

  getClaim() {
    this.isDataLoading = true;
    this.eligibilityService
      .getClaim(
        {
          id_claim: this.idClaimsSearch,
          origin: this.originSearch,
          status: this.statusSearch,
          suscriber_id: this.suscriberSearch
        },
        this.page,
        this.page_size
      )
      .pipe(
        finalize(() => {
          this.isDataLoading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
          this.clearSelections();
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  sendSelectedClaims(): void {
    if (!this.selectedRows.length) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Will be sent ${this.selectedRows.length} claims`,
      icon: 'info',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonText: 'Yes, send',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Sending...',
          text: 'Please wait while your claims are processed',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const claimsToSend = JSON.stringify({ claims: this.selectedRows.map(row => row.id_claim) });

        this.billingService.convertX12(claimsToSend).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Sending successfuly',
              text: 'The claims have been sent successfully',
              allowOutsideClick: false,
            });
            this.clearSelections();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error sending',
              text: `${JSON.stringify(err.error)}`,
              allowOutsideClick: false,
            });
            this.clearSelections();
          }
        });
      }
    });
  }

  checkAll(checked: boolean): void {
    this.allChecked = checked;

    this.dataToDisplay.forEach(item => {
      if (item.status === 1) {
        item.checked = checked;
      }
    });

    this.selectedRows = checked ? this.dataToDisplay.filter(item => item.status === 1) : [];
  }

  updateSelection(record: any): void {
    if (record.checked) {
      if (!this.selectedRows.find(item => item.id_claim === record.id_claim)) {
        this.selectedRows.push(record);
      }
    } else {
      this.selectedRows = this.selectedRows.filter(item => item.id_claim !== record.id_claim);
    }
    this.allChecked = this.dataToDisplay.length > 0 && this.dataToDisplay.every(item => item.checked);
  }

  clearSelections(): void {
    this.selectedRows = [];
    this.allChecked = false;
    this.dataToDisplay.forEach(item => item.checked = false);
  }

  search(value: string | number | null, type: string) {
    if (type === 'origin') {
      this.originSearch = value !== null ? Number(value) : null;
    } else if (type === 'status') {
      this.statusSearch = value !== null ? Number(value) : null;
    }
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value: value ?? null });
  }

  pageChange(event: number) {
    this.page = event;
    this.getClaim();
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getClaim();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  openPdf(data: any): void {
    forkJoin({
      cpts: this.eligibilityService.getClaimCpt({ id_claim: data.id }, null, null, true),
      dx: this.eligibilityService.getClaimDx({ id_claim: data.id }, null, null, true),
      patient: this.eligibilityService.getPatients({ patient_id: data.patient }, null, null, true)
    })
      .subscribe({
        next: (res: any) => {
          const completeData = {
            ...data,
            cpts: res.cpts,
            dx: res.dx,
            patient_data: res.patient[0],
            provider_data: res.patient[0].suppliers[0],
          };

          this.selectedClaim = completeData;
          this.showPdf = true;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        }
      });
  }

  closePdf(): void {
    this.showPdf = false;
    this.selectedClaim = null;
  }

  exportClaims(): void {
    this.eligibilityService
      .getClaim({}, null, null, true)
      .pipe(
        finalize(() => {
          this.exportLoader = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res.length === 0) {
            this.msgService.warning('No data available to export');
            return;
          }

          this.exportLoader = true;

          const headers = {
            date_service: 'Date Service',
            federal_tax_id: 'Federal Tax ID',
            insured_gender: 'Insured Gender',
            service_facility_npi: 'Service Facility NPI',
            service_facility_location: 'Service Facility Location',
            date_signature_doctor: 'Date Signature Doctor',
            relationship: 'Relationship',
            total_charge: 'Total Charge',
            id_claim: 'Id Claim',
            origin: 'Source',
            status: 'Status',
          };

          const selectedColumns = Object.keys(headers) as (keyof typeof headers)[];

          const filteredData = res.map((claim: any) =>
            selectedColumns.reduce((obj: Record<string, any>, key) => {
              if (key === 'status') {
                switch (claim[key]) {
                  case 1:
                    obj[headers[key]] = 'PENDING';
                    break;
                  case 2:
                    obj[headers[key]] = 'IN_PROCESS';
                    break;
                  case 3:
                    obj[headers[key]] = 'FINISHED';
                    break;
                }
              } else if (key === 'origin') {
                switch (claim[key]) {
                  case 1:
                    obj[headers[key]] = 'VISTALINKVX';
                    break;
                  case 2:
                    obj[headers[key]] = 'VISTANET';
                    break;
                }
              } else if (key === 'insured_gender') {
                switch (claim[key]) {
                  case 1:
                    obj[headers[key]] = 'M';
                    break;
                  case 2:
                    obj[headers[key]] = 'F';
                    break;
                }
              } else if (key === 'relationship') {
                switch (claim[key]) {
                  case 1:
                    obj[headers[key]] = 'SELF';
                    break;
                  case 2:
                    obj[headers[key]] = 'SPOUSE';
                    break;
                  case 3:
                    obj[headers[key]] = 'CHILD';
                    break;
                  case 4:
                    obj[headers[key]] = 'OTHER';
                    break;
                }
              } else if (key === 'date_service' || key === 'date_signature_doctor') {
                const date = new Date(claim[key]);
                obj[headers[key]] = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              } else {
                obj[headers[key]] = claim[key];
              }
              return obj;
            }, {})
          );

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Claims');

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
          link.setAttribute('download', 'Claims.xlsx');
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
}
