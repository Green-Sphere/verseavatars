import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogModule,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';

@Component({
  selector: 'app-login-dialog',
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
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.css'
})
export class LoginDialogComponent {
  email: string = '';
  password: string = '';

  constructor(
    private supabaseService: SupabaseService, 
    private dialogRef: MatDialogRef<LoginDialogComponent>, 
    private snackbar: MatSnackBar
  ) {}

  login(){
    this.supabaseService.login(this.email, this.password).then(() => {
      this.dialogRef.close(true);
    }).catch(error => {
      this.snackbar.open('Login failed: ' + error.message, 'Close', {
        duration: 3000
      });
    });
  }
}
