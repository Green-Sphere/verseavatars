import { Component, Inject } from '@angular/core';
import { Avatar, SupabaseService } from '../../services/supabase.service';
import { AvatarCardComponent } from '../../components/avatar-card/avatar-card.component';
import { IgxCarouselModule } from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-avatar-dialog',
  standalone: true,
  imports: [AvatarCardComponent, IgxCarouselModule, CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './avatar-dialog.component.html',
  styleUrl: './avatar-dialog.component.css'
})
export class AvatarDialogComponent {
  deleteConfirm: boolean = false;
  loading: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: {avatar: Avatar, currentUser: User}, private supabaseService: SupabaseService, private dialogRef: MatDialogRef<AvatarDialogComponent>) { }

  deleteAvatar(){
    if(this.data.currentUser.id === this.data.avatar.owner) {
      if(!this.deleteConfirm){
        this.deleteConfirm = true;
        return;
      } else {
        this.loading = true;
        this.supabaseService.deleteAvatar(this.data.avatar.id).then(() => {
          this.dialogRef.close();
        });
        this.loading = true;
      }
    }
  }
}
