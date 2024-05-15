import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Avatar, Filter, PageData, SupabaseService } from './services/supabase.service';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AvatarCardComponent, FooterComponent, CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule, MatPaginatorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'verseavatars';
  avatars: Avatar[] = [];
  totalAvatars: number = 0;
  pageData: PageData = {
    pageSize: 12,
    pageIndex: 0
  }
  filters: Filter[] = [];
  currentUser: User | null = null;
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService, private dialog: MatDialog) {} 
  
  async ngOnInit(){
    this.getAvatars();
    this.getCurrentUser();
  }

  async getAvatars(e: PageEvent | null = null) {
    this.loading = true;
    
    this.pageData = {
      pageSize: e?.pageSize != undefined ? e?.pageSize : this.pageData.pageSize,
      pageIndex: e?.pageIndex != undefined ? e?.pageIndex : this.pageData.pageIndex
    };
    
    this.supabaseService.getAllAvatars(this.pageData, this.filters).then((data) =>{
      this.avatars = data.avatars;
      this.totalAvatars = data.count;
    }).catch((error) => {
      console.error('Error fetching avatars:', error);
    }).finally(() => {
      this.loading = false;
    });
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

