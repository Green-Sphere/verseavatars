import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';

@Component({
  selector: 'app-avatar-form-dialog',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule],
  templateUrl: './avatar-form-dialog.component.html',
  styleUrl: './avatar-form-dialog.component.css'
})
export class AvatarFormDialogComponent implements OnInit {
  name: string = '';
  gameVersion: string = '';
  configFile: File | null = null;
  frontImage: File | null = null;
  profileImage: File | null = null;
  frontImageSrc: string | ArrayBuffer  | null = null;
  profileImageSrc: string | ArrayBuffer  | null = null;
  loading: boolean = false;
  game_versions: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    public dialogRef: MatDialogRef<AvatarFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { avatar: any }
  ) {}

  async ngOnInit(): Promise<void> {
    this.game_versions = await this.supabaseService.getGameVersions();
  }

  onCancel(){
    this.dialogRef.close();
  }

  async onSubmit(){
    let newAvatarId: number;
    this.loading = true;

    await this.supabaseService.createAvatar(this.name, this.gameVersion).then(async (id) => {
      newAvatarId = id;
      if(this.frontImage){
        await this.supabaseService.uploadAvatarImage(this.frontImage, newAvatarId, 'front').then((data) => {
          console.log(data);
        }).catch(error => {
          console.error(`Error uploading image: `, error);
        });
      }

      if(this.profileImage){
        await this.supabaseService.uploadAvatarImage(this.profileImage, newAvatarId, 'profile').then((data) => {
          console.log(data);
        }).catch(error => {
          console.error(`Error uploading image: `, error);
        });
      }

      if(this.configFile){
        await this.supabaseService.uploadAvatarConfig(this.configFile, newAvatarId, this.name).then((data) => {
          console.log(data);
        }).catch(error => {
          console.error(`Error uploading config file: `, error);
        });
      }
    }).catch(error => {
      console.error(`Error creating avatar: `, error);
    });
    
    this.loading = false;
    this.dialogRef.close();
  }

  onFrontImageFileSelected(event: any): void {
    this.frontImage = event.target.files[0] ?? null;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.frontImageSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onProfileImageFileSelected(event: any): void {
    this.profileImage = event.target.files[0] ?? null;
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.profileImageSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onConfigFileSelected(event: any): void {
    this.configFile = event.target.files[0] ?? null;
    console.log('Config file selected:', this.configFile?.type);
    
  }

  formValid(){
    return this.name.trim() !== '' && this.gameVersion.trim() !== '' && this.configFile !== null && this.frontImage !== null && this.profileImage !== null;

  }

}
