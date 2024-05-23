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
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AvatarCardComponent, FooterComponent, CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, FormsModule, MatInputModule, MatSlideToggleModule, MatSidenavModule],
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
  filters = {
    search: '',
    game_version: '',
    liked: false,
    disliked: false,
    starred: false
  };
  currentUser: User | null = null;
  game_versions: string[] = [];
  loading: boolean = false;

  constructor(private supabaseService: SupabaseService, private dialog: MatDialog) {} 
  
  async ngOnInit(){
    this.getAvatars();
    this.getCurrentUser();
    this.game_versions = await this.supabaseService.getGameVersions();
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

