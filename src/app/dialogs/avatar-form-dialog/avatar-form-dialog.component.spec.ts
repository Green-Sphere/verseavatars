import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarFormDialogComponent } from './avatar-form-dialog.component';

describe('AvatarFormDialogComponent', () => {
  let component: AvatarFormDialogComponent;
  let fixture: ComponentFixture<AvatarFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarFormDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AvatarFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
