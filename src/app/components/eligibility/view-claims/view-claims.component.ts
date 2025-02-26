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
import { forkJoin } from 'rxjs';

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
  originSearch: any = null;
  selectedClaim: any = {};
  [key: string]: any;
  searchFields = [
    { placeholder: 'Id Claim...', model: 'idClaimsSearch', key: 'id_claim' },
  ];
  private searchNameSubject = new Subject<{ type: string; value: string | number | null }>();

  constructor(
    private msgService: NzMessageService,
    private eligibilityService: EligibilityService,
  ) {
    this.searchNameSubject
      .pipe(debounceTime(1000))
      .subscribe(({ type, value }) => {
        const fields = {
          id_claim: () => (this.idClaimsSearch = value),
          origin: () => (this.originSearch = value),
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
          patient: this.claimData.patient_id,
          origin: this.originSearch,
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
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  search(value: string | number | null, type: string) {
    if (type === 'origin') {
      this.originSearch = value !== null ? Number(value) : null;
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

  openModalViewClaims(data: any) {
    this.selectedClaim = data;
    this.isDataLoading = true;

    const cptRequest = this.eligibilityService.getClaimCpt(
      { id_claim: this.selectedClaim.id }, null, null, true);

    const dxRequest = this.eligibilityService.getClaimDx(
      { id_claim: this.selectedClaim.id }, null, null, true);

    forkJoin({ cpts: cptRequest, dx: dxRequest })
      .pipe(finalize(() => {
        this.isDataLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.selectedClaim.cpts = res.cpts;
          this.selectedClaim.dx = res.dx;
          this.selectedClaim.modifiers = this.claimData.modifiers;
          this.selectedClaim.provider_data = this.claimData.provider;
          this.selectedClaim.patient_data = this.claimData.patient;
          this.isVisibleModalViewClaim = true;
        },
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        }
      });
  }

  CancelOkModalViewClaims() {
    this.isVisibleModalViewClaim = false;
  }
}
