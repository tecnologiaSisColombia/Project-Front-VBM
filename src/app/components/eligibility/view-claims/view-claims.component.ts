import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
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
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';
import { ClaimEntryComponent } from '../claim-entry/claim-entry.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-view-claims',
  standalone: true,
  imports: [
    NzBreadCrumbModule,
    NzFormModule,
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
    NzEmptyModule,
    ClaimEntryComponent
  ],
  templateUrl: './view-claims.component.html',
  styleUrl: './view-claims.component.css'
})
export class ViewClaimsComponent {
  @Input() claimData: any;
  isDataLoading = false;
  isVisibleModalViewClaim = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  idClaimsSearch: any = null;
  selectedClaim: any = {};
  [key: string]: any;
  searchFields = [
    { placeholder: 'Id Claim...', model: 'idClaimsSearch', key: 'id_claim' },
  ];
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private msgService: NzMessageService,
    private eligibilityService: EligibilityService,
  ) {
    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe(({ type, value }) => {
        const fields = {
          id_claim: () => (this.idClaimsSearch = value),
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
          patient: this.claimData.patient_id
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

          if (this.dataToDisplay.length > 0) {
            // this.getClaimCpt();
          }
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  // getClaimCpt() {
  //   const rawId = this.dataToDisplay[0].id;
  //   this.isDataLoading = true;
  //   this.eligibilityService
  //     .getClaimCpt(
  //       {
  //         id_claim: rawId
  //       },
  //       this.page,
  //       this.page_size,
  //       true
  //     )
  //     .pipe(
  //       finalize(() => {
  //         this.isDataLoading = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log(res)
  //       },
  //       error: (err) => {
  //         this.msgService.error(JSON.stringify(err.error));
  //       },
  //     });
  // }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
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

  openModalViewClaims(data: any) {
    this.selectedClaim = data;
    this.isVisibleModalViewClaim = true;
  }

  CancelOkModalViewClaims() {
    this.isVisibleModalViewClaim = false;
  }
}
