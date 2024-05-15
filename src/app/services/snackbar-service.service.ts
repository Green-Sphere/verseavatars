import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar) { }

  showSnackbar(type: string, message: string, duration: number = 30000) {
    this.snackbar.open(message, '', {
      duration: duration,
      panelClass: [`${type}-snackbar`]
    });
  }
}
