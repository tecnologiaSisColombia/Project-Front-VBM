import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzButtonComponent } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzDrawerModule } from 'ng-zorro-antd/drawer'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzSwitchModule } from 'ng-zorro-antd/switch'
import { NzTableModule } from 'ng-zorro-antd/table'
import { debounceTime, Subject } from 'rxjs'
import { PlanService } from '../../services/insurers/plan.service'
import { NzMessageService } from 'ng-zorro-antd/message'
import Swal from 'sweetalert2'
import { InsurersService } from '../../services/insurers/insurers.service'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { SubplansComponent } from '../subplans/subplans.component'
@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
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
    NzModalModule,
    SubplansComponent,
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css',
})

export class PlansComponent implements OnInit {
  constructor(
    private fb: UntypedFormBuilder,
    private planService: PlanService,
    private msgService: NzMessageService,
    private insurerService: InsurersService,
  ) {
    this.form = this.fb.group({
      insurer: [null, [Validators.required]],
      name: [null, [Validators.required]],
    })
    this.searchNameSubject
      .pipe(debounceTime(2000))
      .subscribe((data: { type: string; value: string }) => {
        // Aquí puedes realizar una acción después de que ha pasado el tiempo de debounce
        if (data.type == 'name') {
          this.nameSearch = data.value
        }

        if (data.type == 'insurer') {
          this.insurerSearch = data.value
        }

        this.getInitData()
      })
  }

  ngOnInit(): void {
    this.getInitData()
    this.getInsurers()
  }

  // searches
  private searchNameSubject: Subject<{
    type: string
    value: string
  }> = new Subject<{ type: string; value: string }>()
  nameSearch: any = null
  insurerSearch: any = null

  // Table
  isDataLoading = false
  dataToDisplay: any[] = []

  // Form
  form: UntypedFormGroup

  // Drawer
  visible = false
  drawerLoader = false
  drawerTitle = ''
  dataDrawerCahe: any
  isUpdating = false

  // Paginator search vars
  num_pages: number = 1
  count_records: number = 0
  page_size: number = 10
  page: number = 1

  // Modal
  isVisibleModal = false
  dataCacheModal: any

  insurers: any[] = []

  getInitData() {
    this.isDataLoading = true
    this.planService
      .getPlans(
        {
          name: this.nameSearch,
          insurer: this.insurerSearch,
        },
        this.page,
        this.page_size,
      )
      .subscribe({
        next: (res: any) => {
          this.isDataLoading = false
          this.dataToDisplay = res.results
          this.setPagination(res.total)
        },
        error: (err) => {
          this.isDataLoading = false
          console.log(err)

          this.msgService.error(JSON.stringify(err.error))
        },
      })
  }

  getInsurers() {
    this.insurerService.getInsurers({ status: 1 }, 1, 10, true).subscribe({
      next: (res: any) => {
        this.insurers = res
      },
      error: (err) => {
        // console.log(err)

        this.msgService.error(JSON.stringify(err.error))
      },
    })
  }

  openDrawer(): void {
    this.visible = true
    this.drawerTitle = 'New Coverage'
  }
  openEditDrawer(data: any): void {
    this.visible = true
    this.isUpdating = true
    this.drawerTitle = 'Edit Coverage'
    this.dataDrawerCahe = data
    this.form.patchValue({ ...data })
  }

  closeDrawer(): void {
    this.drawerLoader = false
    this.isUpdating = false
    this.visible = false
    this.dataDrawerCahe = null
    this.drawerTitle = ''
    this.form.reset()
  }

  delete(id: number) {
    Swal.fire({
      title: 'Are you sure to delete?',
      showDenyButton: true,
      // showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.isDataLoading = true
        this.planService.deletePlan(id).subscribe({
          next: (res: any) => {
            this.msgService.success(res)
            this.isDataLoading = false
            this.getInitData()
          },
          error: (err) => {
            this.isDataLoading = false
            this.msgService.error(JSON.stringify(err.error))
          },
        })
      }
    })
  }

  update(id: number, data: any) {
    this.isDataLoading = true
    this.planService.updatePlan(id, data).subscribe({
      next: (res: any) => {
        this.msgService.success(res)
        this.isDataLoading = false
        this.closeDrawer()
        this.getInitData()
      },
      error: (err) => {
        this.drawerLoader = false
        this.isDataLoading = false
        this.msgService.error(JSON.stringify(err.error))
      },
    })
  }

  submit() {
    if (this.form.valid) {
      this.drawerLoader = true
      if (this.isUpdating) {
        return this.update(this.dataDrawerCahe.id, this.form.value)
      }

      this.planService.createPlan(this.form.value).subscribe({
        next: (res: any) => {
          this.msgService.success('New Coverage created')
          this.isDataLoading = false
          this.getInitData()
          this.closeDrawer()
        },
        error: (err) => {
          this.drawerLoader = false
          this.isDataLoading = false
          this.msgService.error(JSON.stringify(err.error))
        },
      })
    } else {
      Object.values(this.form.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty()
          control.updateValueAndValidity({ onlySelf: true })
        }
      })
    }
  }

  changeStatus(id: number, data: any) {
    delete data.insurer_data
    this.update(id, data)
  }
  // searches
  search(value: string, type: string) {
    this.searchNameSubject.next({
      type,
      value,
    })
  }
  pageChange(event: number) {
    this.page = event
    this.getInitData()
  }
  setPagination(count: number) {
    this.count_records = count
    this.num_pages = Math.ceil(this.count_records / this.page_size)
  }

  // Modal
  openModal(data: any) {
    this.isVisibleModal = true
    this.dataCacheModal = data
  }
  handleCancelModal() {
    this.isVisibleModal = false
    this.dataCacheModal = null
  }
  handleOkModal() {
    this.handleCancelModal()
  }
}
