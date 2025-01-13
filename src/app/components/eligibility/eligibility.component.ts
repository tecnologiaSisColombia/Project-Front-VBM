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
    NzEmptyModule
  ],
  templateUrl: './eligibility.component.html',
  styleUrls: ['./eligibility.component.css', '../../../animations/styles.css']
})
export class EligibilityComponent {
  isDataLoading = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  firstSearch: any = null;
  lastSearch: any = null;
  suscriberSearch: any = null;
  isVisibleModalDetails = false;
  isVisibleModalMember = false;
  isVisibleModalClaim = false;
  isVisibleModalUpload = false;
  selectedPatientName: string = '';
  selectedValidFrom: string = '';
  selectedValidThru: string = '';
  selectedBirthDate: string = '';
  selectedAddressPatient: string = '';
  [key: string]: any;
  searchFields = [
    { placeholder: 'First Name...', model: 'firstSearch', key: 'first_name' },
    { placeholder: 'Last Name...', model: 'lastSearch', key: 'last_name' },
    { placeholder: 'Suscriber Id...', model: 'suscriberSearch', key: 'suscriber_id' },
  ];
  private searchNameSubject = new Subject<{ type: string; value: string }>();
  @ViewChild('memberContent') memberContent!: ElementRef;

  constructor(
    private msgService: NzMessageService,
    private eligibilityService: EligibilityService

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
      .subscribe({
        next: (res: any) => {
          this.isDataLoading = false;
          this.dataToDisplay = res.results;

          const isSearching = this.firstSearch || this.lastSearch || this.suscriberSearch;

          if (isSearching && (!res.results || res.results.length === 0)) {
            this.msgService.warning(JSON.stringify('No results found matching your search criteria'));
          }

          this.setPagination(res.total);
        },
        error: (err) => {
          this.isDataLoading = false;
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  openModalClaim(rowData: any): void {
    this.selectedPatientName = `${rowData.last_name} ${rowData.first_name}`;
    this.selectedValidFrom = rowData.effective;
    this.selectedValidThru = rowData.terminates;
    this.selectedBirthDate = rowData.birth_date;
    this.selectedAddressPatient = `${rowData.primary_address} ${rowData.address_1}`;
    this.isVisibleModalClaim = true;
  }

  cancelModalClaim(): void {
    this.isVisibleModalClaim = false;
  }

  okModalClaim(): void {
    this.isVisibleModalClaim = false;
  }

  cancelModalDetails(): void {
    this.isVisibleModalDetails = false;
  }

  okModalDetails(): void {
    this.cancelModalDetails();
  }

  openModalDetails(): void {
    this.isVisibleModalDetails = true;
  }

  CancelModalMember(): void {
    this.isVisibleModalMember = false;
  }

  openModalMember(): void {
    this.isVisibleModalMember = true;
  }

  OkModalMember(): void {
    this.CancelModalMember();
  }

  pageChange(event: number) {
    this.page = event;
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

  exportBenefits(): void {

  }

  openModalUpload(): void {
    this.isVisibleModalUpload = true;
  }

  okUploadFile(): void {

  }

  cancelModalUpload(): void {
    this.isVisibleModalUpload = false;
  }

  printContentMember(): void {

  }

  printContentDetails(): void {

  }

}