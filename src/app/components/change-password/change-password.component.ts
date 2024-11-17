import { Component, OnInit } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { LoginService } from '../../services/login/login.service'
import { NotificationComponent } from '../../reusable-components'
import { PasswordResetButtonComponent } from '../../reusable-components'
import { CommonModule } from '@angular/common'
import { passwordRegex } from '../../utils/password_regex'

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    NotificationComponent,
    PasswordResetButtonComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup
  session: string | null = null
  username: string | null = null
  message: string | null = null
  messageType: 'error' | 'success' | null = null
  isLoading: boolean = false 
  btnActive: boolean = false 

  passwordRight: boolean = false
  passwordConfirm: boolean = false

  regex = passwordRegex

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.changePasswordForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    })
  }

  ngOnInit(): void {
    this.session = this.route.snapshot.queryParamMap.get('session')
    this.username = this.route.snapshot.queryParamMap.get('username')
  }

  passwordChange(value: string) {
    if (this.regex.test(value)) {
      this.passwordRight = true
    } else {
      this.btnActive = false
      this.passwordRight = false
    }
  }

  confirmPasswordChange(value: string) {
    if (value === this.changePasswordForm.value.new_password) {
      this.passwordConfirm = true;
      if (this.session && this.username) {
        this.btnActive = true;
      } else {
        this.btnActive = false;
      }
    } else {
      this.btnActive = false;
      this.passwordConfirm = false;
    }
  }

  closeMessage(): void {
    this.message = null
    this.messageType = null
  }

  showMessage(message: string, type: 'error' | 'success'): void {
    this.message = message;
    this.messageType = type;
  }

  changePassword(): void {
    const new_password = this.changePasswordForm.value.new_password
    if (
      !this.regex.test(new_password) ||
      this.changePasswordForm.value.new_password !=
      this.changePasswordForm.value.confirmPassword
    ) {
      return
    }

    if (this.username && this.session) {
      this.isLoading = true
      this.loginService
        .changeTemporaryPassword(this.username, new_password, this.session)
        .subscribe(
          (response) => {
            this.isLoading = false
            if (response.status) {
              this.router.navigate(['/login'])
            } else {
              this.message = response.error.message
              this.messageType = 'error'
            }
          },
          (error) => {
            this.isLoading = false
            const errorMessage =
              error.error?.error?.message || 'Change Password failed. Please try again.';
            this.showMessage(errorMessage, 'error');
          },
        )
    }
  }
}
