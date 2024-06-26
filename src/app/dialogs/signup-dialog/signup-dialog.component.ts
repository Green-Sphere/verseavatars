import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../../services/supabase.service';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogModule,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { SnackbarService } from '../../services/snackbar-service.service';

@Component({
  selector: 'app-signup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ],
  templateUrl: './signup-dialog.component.html',
  styleUrl: './signup-dialog.component.css'
})
export class SignupDialogComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private dialogRef: MatDialogRef<SignupDialogComponent>,
    private snackbarService: SnackbarService
  ) {}

  formValid(){
    return this.email && this.password && this.confirmPassword && this.password === this.confirmPassword;
  }

  onSubmit(){
    if (this.formValid()) {
      this.supabaseService.signup(this.email, this.password)
        .then(() => {
          this.dialogRef.close(true);
          this.snackbarService.showSnackbar('success', 'Signup successful, check your email for a confirmation link!', 5000);
        })
        .catch(error => {
          this.snackbarService.showSnackbar('error', 'Signup failed: ' + error.message, 3000);
        });
    }

  }
}
