import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { Reservation } from 'src/app/_interfaces/reservation';
import { Item } from 'src/app/_interfaces/item';
import { Account } from 'src/app/_interfaces/account';
import { Locker } from 'src/app/_interfaces/locker';
import { DatabaseService } from 'src/app/_services/database.service';

@Component({
  selector: 'app-reservation-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="reservationForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <label> Item: 
        <div class="admin-radio">
          <div *ngFor="let item of items$ | async">
            <label class="admin-radio-item">
              <input type="radio" formControlName="itemName" [value]="item.itemName">
              <p> {{"(" + item.itemLock + ") " + item.itemName}} </p>
            </label>
          </div>
        </div>
      </label>
    </div>

    <!-- Delete and add default answer based on chosen locker -->
    <div class="admin-question">
      <label> In Locker: 
        <div class="admin-radio">
          <div *ngFor="let locker of lockers$ | async">
            <label class="admin-radio-item"> <input type="radio" formControlName="itemLock" [value]="locker.lockName"> {{locker.lockName}} </label>
          </div>
        </div>
      </label>
    </div>

    <div class="admin-question">
      <label> Account:
        <div class="admin-radio">
          <div class="admin-radio-item" *ngFor="let account of accounts$ | async">
            <input type="radio" formControlName="userName" name="userName" id="userName" [value]="account.userName">
            {{account.userName}}
          </div>
        </div>
      </label>
    </div>

    <div class="admin-question">
      <label>Start Time: &nbsp; </label>
      <input class="admin-dt-local" type="datetime-local" formControlName="strtTime" required>

      <div *ngIf="strtTime.invalid && (strtTime.dirty || strtTime.touched)">
        <div class="admin-error-msg" *ngIf="strtTime.errors?.['required']"> required </div>
      </div>
    </div>

    <div class="admin-question">
      <label>Stop Time: &nbsp; </label>
      <input class="admin-dt-local" type="datetime-local" formControlName="stopTime" required>

      <div *ngIf="stopTime.invalid && (stopTime.dirty || stopTime.touched)">
        <div class="admin-error-msg" *ngIf="stopTime.errors?.['required']"> required </div>
      </div>
    </div>

    <div class="admin-question">
      <label> Event
        <div class="admin-radio">
          <label class="admin-radio-item"> <input type="radio" formControlName="pickedUp" [value]="false"> Pick Up </label>
          <label class="admin-radio-item"> <input type="radio" formControlName="pickedUp" [value]="true"> Return </label>
        </div>
      </label>
    </div>

    <button class="bubble-button" type="submit" [disabled]="reservationForm.invalid">Add</button>
  </form>
  `
})
export class ReservationFormComponent implements OnInit {
  items$: Observable<Item[]> = new Observable();
  accounts$: Observable<Account[]> = new Observable();
  lockers$: Observable<Locker[]> = new Observable();

  @Input()
  initialState: BehaviorSubject<Reservation> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Reservation>();
  @Output()
  formSubmitted = new EventEmitter<Reservation>();

  reservationForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) { }

  get itemName() { return this.reservationForm.get('itemName')!; }
  get itemLock() { return this.reservationForm.get('itemLock')!;}
  get userName() { return this.reservationForm.get('userName')!; }
  get strtTime() { return this.reservationForm.get('strtTime')!; }
  get stopTime() { return this.reservationForm.get('stopTime')!; }
  get pickedUp() { return this.reservationForm.get('pickedUp')!; }
  
  ngOnInit() {
    this.accounts$ = this.databaseService.getAccounts();
    this.items$ = this.databaseService.getItems();
    this.lockers$ = this.databaseService.getLockers();

    this.initialState.subscribe(reservation => {
      this.reservationForm = this.fb.group({
        itemName: [ reservation.itemName, [Validators.required, Validators.minLength(3)] ],
        itemLock: [ reservation.itemLock, [Validators.required] ],
        userName: [ reservation.userName, [Validators.required, Validators.minLength(3)] ],
        strtTime: [ reservation.strtTime, [Validators.required] ],
        stopTime: [ reservation.stopTime, [Validators.required] ],
        pickedUp: [ reservation.pickedUp, [Validators.required] ]
      });
    });

    this.reservationForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  submitForm() {
    this.formSubmitted.emit(this.reservationForm.value);
  }
}
