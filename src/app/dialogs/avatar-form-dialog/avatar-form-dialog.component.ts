import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SupabaseService } from '../../services/supabase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { SnackbarService } from '../../services/snackbar-service.service';

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
    MatProgressSpinnerModule,
    MatChipsModule],
  templateUrl: './avatar-form-dialog.component.html',
  styleUrl: './avatar-form-dialog.component.css'
})
export class AvatarFormDialogComponent implements OnInit {
  inputLength: number = 32;
  name: string = '';
  gameVersion: string = '';
  configFile: File | null = null;
  frontImage: File | null = null;
  profileImage: File | null = null;
  frontImageSrc: string | ArrayBuffer  | null = null;
  profileImageSrc: string | ArrayBuffer  | null = null;
  loading: boolean = false;
  game_versions: string[] = [];
  tags: string[] = [];
  dragAreaClassFront: string | undefined;
  dragAreaClassProfile: string | undefined;
  dragAreaClassConfig: string | undefined;

  constructor(
    private supabaseService: SupabaseService,
    public dialogRef: MatDialogRef<AvatarFormDialogComponent>,
    private snackbarService: SnackbarService,
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
          this.snackbarService.showSnackbar('error', `Error uploading image file`);
          this.supabaseService.deleteAvatar(newAvatarId).catch(() => {
            console.error(`Error deleting avatar`);
          });
        });
      }

      if(this.profileImage){
        await this.supabaseService.uploadAvatarImage(this.profileImage, newAvatarId, 'profile').then((data) => {
          console.log(data);
        }).catch(error => {
          this.snackbarService.showSnackbar('error', `Error uploading image file`);
          this.supabaseService.deleteAvatar(newAvatarId).catch(() => {
            console.error(`Error deleting avatar`);
          });
        });
      }

      if(this.configFile){
        await this.supabaseService.uploadAvatarConfig(this.configFile, newAvatarId, this.name).then((data) => {
          console.log(data);
        }).catch(error => {
          this.snackbarService.showSnackbar('error', `Error uploading config file`);
          this.supabaseService.deleteAvatar(newAvatarId).catch(() => {
            console.error(`Error deleting avatar`);
          });
        });
      }

      if(this.tags.length > 0) {
        await this.supabaseService.addAvatarTags(newAvatarId, this.tags).then((data) => {
          console.log(data);
        }).catch(() => {
          this.snackbarService.showSnackbar('error', `Error adding tags to avatar`);
        })
      }
    }).catch(error => {
      console.error(`Error creating avatar: `, error);
    });
    
    this.loading = false;
    this.dialogRef.close();
  }

  onFrontImageFileSelected(event: any): void {
    const fileAttached = event.target?.files ? event.target?.files[0] : event.dataTransfer?.files[0];
    this.frontImage = fileAttached;
    if (fileAttached) {
      const file = fileAttached;
      const reader = new FileReader();
      reader.onload = e => this.frontImageSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onProfileImageFileSelected(event: any): void {
    const fileAttached = event.target?.files ? event.target.files[0] : event.dataTransfer?.files[0];
    this.profileImage = fileAttached;
    if (fileAttached) {
      const file = fileAttached;
      const reader = new FileReader();
      reader.onload = e => this.profileImageSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  async onConfigFileSelected(event: any) {
    const fileAttached = event.target?.files ? event.target?.files[0] : event.dataTransfer?.files[0];
    this.validateFile(fileAttached).then(() => {
      console.log(fileAttached);
      this.configFile = fileAttached;
    }).catch((e) => {
      console.log(e)
      this.snackbarService.showSnackbar('error', e.message);
    });
  }

  addTag(event: MatChipInputEvent, input: HTMLInputElement): void {
    const value = event.value.trim();

    if(this.tags.length >= 10){
      this.snackbarService.showSnackbar('error', 'Maximum of 10 tags allowed.');
      return;
    }

    if (value && !this.tags.includes(value)) {
      this.tags.push(value.trim());
      input.value = '';
    }
  }

  removeTag(tagToRemove: string): void {
    this.tags = this.tags.filter(tag => tag !== tagToRemove.trim());
  }

  formValid(){
    return this.name.trim() !== '' && this.gameVersion.trim() !== '' && this.configFile !== null && this.frontImage !== null && this.profileImage !== null;

  }

  validateFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Ensure the file is at least 2 bytes long
      if (file.size < 2) {
        reject(new Error('File is too small to contain the required data.'));
        return;
      }

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const array = Array.from(new Uint8Array(reader.result));
          if(array.length > 4096) reject(new Error('File size exceeds the maximum allowed size of 4MB'));
          const binaryString = String.fromCharCode(...array);
          const first2Chars = binaryString.slice(0, 2);
          console.log(first2Chars);
          if (first2Chars === 'BB') {
            resolve(file);
          } else {
            reject(new Error('File does not start with BB in hexadecimal'));
          }
        } else {
          reject(new Error('Error reading file: no result from FileReader'));
        }
      };

      reader.onerror = (error) => {
        reject(new Error('Error reading file: ' + error));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  deleteFile(file: string) {
    switch(file) {
      case 'front':
        this.frontImage = null;
        this.frontImageSrc = null;
        break;
      case 'profile':
        this.profileImage = null;
        this.profileImageSrc = null;
        break;
      case 'config':
        this.configFile = null;
        break;
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
    console.log("dragover");
    event && event.preventDefault();
    event && event.stopPropagation();
    const enclosingDivId = event.target.closest('div').id;
    if(enclosingDivId === 'frontImageUpload') {
      this.dragAreaClassFront = "fileover";
    } else if(enclosingDivId === 'profileImageUpload') {
      this.dragAreaClassProfile = "fileover";
    } else if(enclosingDivId === 'configUpload') {
      this.dragAreaClassConfig = "fileover";
    }
  }

  @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const enclosingDivId = event.target.closest('div').id;
    if(enclosingDivId === 'frontImageUpload') {
      this.dragAreaClassFront = "";
    } else if(enclosingDivId === 'profileImageUpload') {
      this.dragAreaClassProfile = "";
    } else if(enclosingDivId === 'configUpload') {
      this.dragAreaClassConfig = "";
    }
  }

  @HostListener("drop", ["$event"]) onDrop(event: any) {
    event && event.preventDefault();
    event && event.stopPropagation();
    const files = event.dataTransfer?.files;
    const enclosingDivId = event.target.closest('div').id;
    if (files && files.length > 0) {
      if(enclosingDivId === 'frontImageUpload') {
        this.onFrontImageFileSelected(event);
        this.dragAreaClassFront = "";
      } else if(enclosingDivId === 'profileImageUpload') {
        this.onProfileImageFileSelected(event);
        this.dragAreaClassProfile = "";
      } else if(enclosingDivId === 'configUpload') {
        this.onConfigFileSelected(event);
        this.dragAreaClassConfig = "";
      }
    }
  }

}
