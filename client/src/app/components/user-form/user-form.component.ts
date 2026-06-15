import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [ProfileService],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  protected user: any = {};
  userForm: FormGroup;
  fileToUpload: File | null = null;
  image: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private dialogRef: MatDialogRef<UserFormComponent>,
    private profileService: ProfileService,
    private formBuilder: FormBuilder
  ) {
    this.userForm = this.formBuilder.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        phone: ['', Validators.required],
        role: ['', Validators.required],
        newPassword: [''],
        confirmNewPassword: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
    this.user = data.user;
    this.userForm.setValue({
      fullName: this.user.fullName || '',
      email: this.user.email || '',
      username: this.user.username || '',
      phone: this.user.phone || '',
      role: this.user.role || 'user',
      newPassword: '',
      confirmNewPassword: '',
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;

    if (!newPassword && !confirmNewPassword) {
      return null;
    }

    return newPassword === confirmNewPassword
      ? null
      : { passwordMismatch: true };
  }

  get passwordMismatch(): boolean {
    return !!(
      this.userForm.hasError('passwordMismatch') &&
      (this.userForm.get('confirmNewPassword')?.touched ||
        this.userForm.get('confirmNewPassword')?.dirty)
    );
  }

  onSubmit() {
    if (this.userForm.valid) {
      const updatedUserData: any = {
        fullName: this.userForm.value.fullName,
        email: this.userForm.value.email,
        username: this.userForm.value.username,
        phone: this.userForm.value.phone,
        role: this.userForm.value.role,
      };

      if (this.userForm.value.newPassword) {
        updatedUserData.newPassword = this.userForm.value.newPassword;
        updatedUserData.confirmNewPassword = this.userForm.value.confirmNewPassword;
      }

      this.profileService.adminUpdateProfile(updatedUserData).subscribe({
        next: (response) => {
          this.dialogRef.close('success');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        },
      });
    }
  }
}

