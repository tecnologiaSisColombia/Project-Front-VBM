import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@Component({
  selector: 'app-eligibility',
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzUploadModule,
    NzCardModule,
    NzSelectModule,
    ReactiveFormsModule,
    CommonModule,
    NzBreadCrumbModule,
    NzDatePickerModule,
    NzCollapseModule,
    NzDrawerModule,
    FormsModule,
    NzLayoutModule
  ],
  templateUrl: './eligibility.component.html',
  styleUrl: './eligibility.component.css'
})
export class EligibilityComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      physician: ['', [Validators.required, Validators.minLength(100)]],
      insurance: ['', Validators.required],
      healthPlan: ['', Validators.required],
      dateOfService: ['', Validators.required],
      validationOptions: [[]],
      validationNotes: ['', [Validators.maxLength(250)]],
      files: [null],
      memberId: ['', [Validators.required, Validators.minLength(20)]],
      firstName: ['', [Validators.required, Validators.minLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(50)]],
      dateOfBirth: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    } else {
      console.log('Formulario inválido');
    }
  }
}