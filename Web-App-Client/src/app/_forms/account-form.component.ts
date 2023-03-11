import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { Account } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-account-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="accountForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <input class="admin-text" type="email" formControlName="userName" placeholder="Email" required>
      
      <div *ngIf="userName.invalid && (userName.dirty || userName.touched)">
        <div class="admin-error-msg" *ngIf="userName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="userName.errors?.['minlength']"> must be at least 3 characters </div>
      </div>
    </div>

    <div class="admin-question">
      <input class="admin-text" type="password" formControlName="password" placeholder="Password" required>

      <div *ngIf="password.invalid && (password.dirty || password.touched)">
        <div class="admin-error-msg" *ngIf="password.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="password.errors?.['minlength']"> must be at least 5 characters </div>
      </div>
    </div>

    <div class="admin-question">
      <label> Customer Type:
        <div class="admin-radio">
          <label class="admin-radio-item"> <input type="radio" formControlName="userType" value="manager"> Manager </label>
          <label class="admin-radio-item"> <input type="radio" formControlName="userType" value="customer"> Customer </label>
        </div>
      </label>
    </div>

    <div class="admin-question">
      <input class="admin-text" type="text" formControlName="foreName" placeholder="First Name" required>

      <div *ngIf="foreName.invalid && (foreName.dirty || foreName.touched)">
        <div class="admin-error-msg" *ngIf="foreName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="foreName.errors?.['minlength']"> must be at least 1 character </div>
      </div>
    </div>

    <div class="admin-question">
      <input class="admin-text" type="text" formControlName="lastName" placeholder="Last Name" required>

      <div *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)">
        <div class="admin-error-msg" *ngIf="lastName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="lastName.errors?.['minlength']"> must be at least 1 character </div>
      </div>
    </div>

    <div class="admin-question">
      <input class="admin-text" type="text" maxlength="10" formControlName="userRFID" placeholder="RFID Number" required>

      <div *ngIf="userRFID.invalid && (userRFID.dirty || userRFID.touched)">
        <div class="admin-error-msg" *ngIf="userRFID.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="userRFID.errors?.['minlength']"> must be 10 numbers </div>
      </div>
    </div>

    <button class="bubble-button" type="submit" [disabled]="accountForm.invalid">Add</button>
  </form>
  `
})
export class AccountFormComponent implements OnInit {
  @Input()
  initialState: BehaviorSubject<Account> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Account>();
  @Output()
  formSubmitted = new EventEmitter<Account>();

  accountForm: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) { }

  get userName() { return this.accountForm.get('userName')!; }
  get password() { return this.accountForm.get('password')!; }
  get userType() { return this.accountForm.get('userType')!; }
  get userRFID() { return this.accountForm.get('userRFID')!; }
  get foreName() { return this.accountForm.get('foreName')!; }
  get lastName() { return this.accountForm.get('lastName')!; }

  ngOnInit() {
    // initial state of form
    this.initialState.subscribe(account => {
      this.accountForm = this.fb.group({
        userName: [ account.userName, [Validators.required, Validators.minLength(3)] ],
        password: [ account.password, [Validators.required, Validators.minLength(5)] ],
        userType: [ account.userType, [Validators.required] ],
        userRFID: [ account.userRFID, [Validators.required, Validators.minLength(10)] ],
        foreName: [ account.foreName, [Validators.required, Validators.minLength(1)] ],
        lastName: [ account.lastName, [Validators.required, Validators.minLength(1)] ]
      });
    });

    // changed state of form
    this.accountForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  // emits values in form
  submitForm() {
    this.formSubmitted.emit(this.accountForm.value);
  }
}