import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Avatar, SupabaseService } from '../../services/supabase.service';
import { IgxCarouselModule } from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { User } from '@supabase/supabase-js';
import { AvatarDialogComponent } from '../../dialogs/avatar-dialog/avatar-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from '../../services/snackbar-service.service';

@Component({
  selector: 'app-avatar-card',
  standalone: true,
  imports: [IgxCarouselModule, CommonModule, MatIconModule],
  templateUrl: './avatar-card.component.html',
  styleUrl: './avatar-card.component.css'
})
export class AvatarCardComponent {
  @Input() avatar: Avatar | undefined;
  @Input() currentUser: User | null = null;
  @Output() avatarUpdated: EventEmitter<Avatar> = new EventEmitter<Avatar>();

  constructor(private supabaseService: SupabaseService, public dialog: MatDialog, private snackBar: MatSnackBar, private snackbarService: SnackbarService) {}

  async updateAvatar(){
    if(this.avatar?.id) this.avatar = await this.supabaseService.getAvatar(this.avatar?.id);
    console.log(this.avatar);
  }

  openAvatarDialog(avatar:Avatar|undefined){
    if(!avatar) return;
    const dialogRef = this.dialog.open(AvatarDialogComponent, {
      width: '400px',
      data: {avatar: avatar, currentUser: this.currentUser},
    });

    dialogRef.afterClosed().subscribe(result => {
      //this.avatarUpdated.emit(result);
    });
  }

  vote(direction: string){
    if(!this.currentUser){
      this.snackbarService.showSnackbar('normal', 'You must be logged in to vote');
      return;
    }

    const voteDirection = direction === 'up' ? true : false;
    if(this.avatar?.user_vote === voteDirection){
      this.supabaseService.removeVote(this.avatar.id, this.currentUser!.id).then(() => {
        this.updateAvatar();
      });
    } else {
      this.supabaseService.avatarVote(this.avatar!.id, this.currentUser!.id, voteDirection).then(() => {
        this.updateAvatar();
      });
    }
  }
}
