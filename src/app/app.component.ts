import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avatar, SupabaseService } from './services/supabase.service';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AvatarCardComponent } from './components/avatar-card/avatar-card.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { User } from '@supabase/supabase-js';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarFormDialogComponent } from './dialogs/avatar-form-dialog/avatar-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AvatarCardComponent, FooterComponent, CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'verseavatars';
  avatars: Avatar[] = [];
  currentUser: User | null = null;
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService, private dialog: MatDialog) {} 
  
  async ngOnInit(){
    this.getAvatars();
    this.getCurrentUser();
  }

  async getAvatars(){
    this.loading = true;
    this.avatars = await this.supabaseService.getAllAvatars();
    this.loading = false;
  }

  async getCurrentUser() {
    this.currentUser = await this.supabaseService.getLoggedInUser();
  }

  newAvatarDialog(){
    const dialogRef = this.dialog.open(AvatarFormDialogComponent, {
      data: {avatar: undefined},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(() => { this.getAvatars(); });
  }

  reloadPage() {
    window.location.reload();
  }
}

