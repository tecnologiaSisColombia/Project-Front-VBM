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
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-member',
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
    NzModalModule
  ],
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.css']
})
export class MemberComponent {
  isDataLoading = false;
  dataToDisplay: any[] = [];
  num_pages = 1;
  count_records = 0;
  page_size = 10;
  page = 1;
  isVisibleModal = false;
  [key: string]: any;
  private searchNameSubject = new Subject<{ type: string; value: string }>();

  constructor(
    private msgService: NzMessageService
  ) {
  }

  ngOnInit(): void {
    // this.getInitData();
    // this.getSuppliers();
  }

  search(value: string, type: string) {
    this.isDataLoading = true;
    this.searchNameSubject.next({ type, value });
  }

  handleCancelModal(): void {
    this.isVisibleModal = false;
    // this.dataCacheModal = null;
  }

  openModal(): void {
    this.isVisibleModal = true;
    // this.dataCacheModal = data;
  }

  handleOkModal(): void {
    this.handleCancelModal();
  }

  openPlanDetails(event: number) {
    // this.page = event;
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

  exportMember(): void {
  }
}