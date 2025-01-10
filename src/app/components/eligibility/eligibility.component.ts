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
    ClaimEntryComponent
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

  CancelModalDetails(): void {
    this.isVisibleModalDetails = false;
    // this.dataCacheModal = null;
  }

  CancelModalMember(): void {
    this.isVisibleModalMember = false;
    // this.dataCacheModal = null;
  }

  openModalMember(): void {
    this.isVisibleModalMember = true;
    // this.dataCacheModal = data;
  }

  openModalDetails(): void {
    this.isVisibleModalDetails = true;
    // this.dataCacheModal = data;
  }

  openModalClaim(): void {
    this.isVisibleModalClaim = true;
    // this.dataCacheModal = data;
  }

  CancelModalClaim(): void {
    this.isVisibleModalClaim = false;
    // this.dataCacheModal = null;
  }

  OkModalMember(): void {
    this.CancelModalMember();
  }

  OkModalClaim(): void {
    this.isVisibleModalClaim = false;
  }

  OkModalDetails(): void {
    this.CancelModalDetails();
  }

  openPlanDetails(event: number) {
    this.page = event;
    // this.getInitData();
  }

  pageChange(event: number) {
    this.page = event;
    // this.getInitData();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  exportBenefits(): void {

  }

  printContentMember(): void {

  }

  printContentDetails(): void {

  }

}