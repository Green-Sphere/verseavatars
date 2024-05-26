import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../../dialogs/login-dialog/login-dialog.component';
import { SignupDialogComponent } from '../../dialogs/signup-dialog/signup-dialog.component';
import { LogoutDialogComponent } from '../../dialogs/logout-dialog/logout-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private dialog: MatDialog, private supabase: SupabaseService) {}
  @Input() userLoggedIn: boolean = false;
  @Output() loginChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  loginDialog(){
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '500px',
      panelClass: 'verse-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loginChange.emit();
      }
    });
  }

  signupDialog(){
    const dialogRef = this.dialog.open(SignupDialogComponent, {
      width: '500px',
      panelClass: 'verse-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  logoutDialog(){
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      panelClass: 'verse-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.supabase.logout().then(() => {
          this.loginChange.emit();
        });
      }
    });
  }
}
