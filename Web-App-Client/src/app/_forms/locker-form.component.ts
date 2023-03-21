import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { Locker } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-locker-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="lockerForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <input class="admin-text" type="text" formControlName="lockName" placeholder="Locker Name" required>

      <div *ngIf="lockName.invalid && (lockName.dirty || lockName.touched)">
        <div class="admin-error-msg" *ngIf="lockName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="lockName.errors?.['minlength']"> must be at least 3 characters </div>
      </div>
    </div>

    <div class="admin-question">
      <label > Last Opened: &nbsp; </label>
      <input class="admin-dt-local" type="datetime-local" formControlName="lastOpen" required>

      <div *ngIf="lastOpen.invalid && (lastOpen.dirty || lastOpen.touched)">
        <div class="admin-error-msg" *ngIf="lastOpen.errors?.['required']"> required </div>
      </div>
    </div>

    <div class="admin-question">
      <label > Last Closed: &nbsp; </label>
      <input class="admin-dt-local" type="datetime-local" formControlName="lastShut" required>

      <div *ngIf="lastShut.invalid && (lastShut.dirty || lastShut.touched)">
        <div class="admin-error-msg" *ngIf="lastShut.errors?.['required']"> required </div>
      </div>
    </div>

    <button class="bubble-button" type="submit" [disabled]="lockerForm.invalid">Submit</button>
  </form>
  ` 
})
export class LockerFormComponent implements OnInit {
  public lockerForm: FormGroup = new FormGroup({});

  constructor(private formBuilder: FormBuilder) {}
  @Input()
  initialState: BehaviorSubject<Locker> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Locker>();
  @Output()
  formSubmitted = new EventEmitter<Locker>();

  get lockName() { return this.lockerForm.get('lockName')!; }
  get lastOpen() { return this.lockerForm.get('lastOpen')!; }
  get lastShut() { return this.lockerForm.get('lastShut')!; }

  ngOnInit() {
    this.initialState.subscribe(locker => {
      this.lockerForm = this.formBuilder.group({
        lockName: [ locker.lockName, [Validators.required] ],
        lastOpen: [ locker.lastOpen, [Validators.required] ],
        lastShut: [ locker.lastShut, [Validators.required] ]
      });
    });

    this.lockerForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  submitForm() { this.formSubmitted.emit(this.lockerForm.value); }
}