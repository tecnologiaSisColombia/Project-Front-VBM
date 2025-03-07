import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
import { debounceTime, Subject, switchMap, of, tap } from 'rxjs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { finalize, } from 'rxjs/operators';
import { EligibilityService } from 'app/services/eligibility/eligibility.service';

@Component({
  selector: 'app-member',
  imports: [
    NzBreadCrumbModule,
    NzFormModule,
    // NzButtonComponent,
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
    NzEmptyModule
  ],
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent {
  @Input() claimData: any;
  isDataLoading = false;
  dataToDisplay: any[] = [];
  claimCpts: any
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  serviceSearch: any = null;
  idClaimsSearch: any = null;
  statusSearch: any = null
  originSearch: any = null;
  icdSearch: any = null;
  [key: string]: any;
  searchFields = [
    // { placeholder: 'Claim ID...', model: 'idClaimsSearch', key: 'id_claim' },
    // { placeholder: 'Service...', model: 'serviceSearch', key: 'service' },
    // { placeholder: 'ICD...', model: 'icdSearch', key: 'icd' },
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
          service: () => (this.serviceSearch = value),
          icd: () => (this.icdSearch = value),
          origin: () => (this.originSearch = value),
          status: () => (this.statusSearch = value),
          id_claim: () => (this.idClaimsSearch = value),
        };

        (fields as Record<string, () => void>)[type]?.();
        this.page = 1;
        this.getClaim();
        this.isDataLoading = false;
      });
  }

  ngOnInit(): void {
    this.getClaim();
  }

  getClaim() {
    this.isDataLoading = true;
    this.eligibilityService
      .getClaim(
        {
          id_claim: this.idClaimsSearch,
          patient: this.claimData.patient_id,
          origin: this.originSearch
        },
        null,
        null
      )
      .pipe(
        tap((res: any) => {
          this.dataToDisplay = res.results;
          this.setPagination(res.total);
        }),
        switchMap(() =>
          (this.dataToDisplay && this.dataToDisplay.length) ?
            this.eligibilityService.getClaimCpt(
              {
                claim_ids: this.dataToDisplay.map(claim => claim.id)
              },
              null,
              null,
              true
            ) : of([])
        ),
        tap((cptRes: any) => {
          if (cptRes.length) {
            const grouped = cptRes.reduce((acc: any, record: any) => {
              const { claim, service, dx } = record;
              acc[claim] = acc[claim] || { services: [], diags: [] };
              acc[claim].services.push(service);
              acc[claim].diags.push(dx);
              return acc;
            }, {});
            this.dataToDisplay = this.dataToDisplay.map((claim: any) => ({
              ...claim,
              services: grouped[claim.id]?.services ?? grouped[claim.id]?.products ?? [],
              diags: grouped[claim.id]?.diags || []
            }));
          }
        }),
        finalize(() => {
          this.isDataLoading = false;
        })
      )
      .subscribe({
        error: (err) => {
          this.msgService.error(JSON.stringify(err.error));
        },
      });
  }

  search(value: string, type: string) {
    if (type === 'origin') {
      this.originSearch = value !== null ? Number(value) : null;
    } else if (type === 'status') {
      this.statusSearch = value !== null ? Number(value) : null;
    }
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  pageChange(event: number) {
    this.page = event;
    this.getClaim();
  }

  setPagination(count: number) {
    this.count_records = count;
    this.num_pages = Math.ceil(count / this.page_size);
  }

  pageSizeChange(pageSize: number): void {
    this.page_size = pageSize;
    this.page = 1;
    this.getClaim();
  }

  exportMember(): void {
  }
}