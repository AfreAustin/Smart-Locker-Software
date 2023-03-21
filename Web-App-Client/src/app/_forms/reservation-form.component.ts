import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';
import { Account, Item, Locker, Reservation } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-reservation-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="reservationForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <label> Item: 
        <div class="admin-radio">
          <div *ngFor="let item of items$ | async">
            <label class="admin-radio-item">
              <input type="radio" formControlName="itemID" [value]="item._id">
              <p> {{"(" + item.itemLock + ") " + item.itemName}} </p>
            </label>
          </div>
        </div>
      </label>
    </div>

    <div class="admin-question">
      <label> Account:
        <div class="admin-radio">
          <div *ngFor="let account of accounts$ | async">
            <label class="admin-radio-item">
              <input type="radio" formControlName="userID" [value]="account._id">
              {{account.userName}}
            </label>
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

    <button class="bubble-button" type="submit" [disabled]="reservationForm.invalid">Submit</button>
  </form>
  `
})
export class ReservationFormComponent implements OnInit {
  public reservationForm: FormGroup = new FormGroup({});
  public accounts$: Observable<Account[]> = new Observable();
  public items$: Observable<Item[]> = new Observable();
  public lockers$: Observable<Locker[]> = new Observable();

  @Input()
  initialState: BehaviorSubject<Reservation> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Reservation>();
  @Output()
  formSubmitted = new EventEmitter<Reservation>();

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService
  ) {}

  get itemID() { return this.reservationForm.get('itemID')!; }
  get userID() { return this.reservationForm.get('userID')!; }
  get strtTime() { return this.reservationForm.get('strtTime')!; }
  get stopTime() { return this.reservationForm.get('stopTime')!; }
  get pickedUp() { return this.reservationForm.get('pickedUp')!; }
  
  ngOnInit() {
    this.accounts$ = this.databaseService.getAccounts();
    this.items$ = this.databaseService.getItems();
    this.lockers$ = this.databaseService.getLockers();

    this.initialState.subscribe(reservation => {
      this.reservationForm = this.formBuilder.group({
        itemID: [ reservation.itemID, [Validators.required, Validators.minLength(3)] ],
        userID: [ reservation.userID, [Validators.required, Validators.minLength(3)] ],
        strtTime: [ this.convertTime(reservation.strtTime!), [Validators.required] ],
        stopTime: [ this.convertTime(reservation.stopTime!), [Validators.required] ],
        pickedUp: [ reservation.pickedUp, [Validators.required] ]
      });
    });

    this.reservationForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  submitForm() { 
    this.reservationForm.controls['strtTime'].setValue(this.convertDate(this.strtTime.getRawValue().toString()));
    this.reservationForm.controls['stopTime'].setValue(this.convertDate(this.stopTime.getRawValue().toString()));
    this.formSubmitted.emit(this.reservationForm.value); 
  }

  private convertDate(date: string): Number {
    if (!date) return 0;
    
    let dateRgx = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
    let dateArr = dateRgx.exec(date);
    let dateNum = 
      (+dateArr![1] * 100000000) + 
      (+dateArr![2] * 1000000) + 
      (+dateArr![3] * 10000) +
      (+dateArr![4] * 100) +
      (+dateArr![5]);
    return dateNum;
  }

  private convertTime(time: Number): string {
    if (!time) return "";

    let timeRgx = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;
    let timeArr = timeRgx.exec(time.toString());
    let timeStr = timeArr![1] + "-" + timeArr![2] + "-" + timeArr![3] + "T" + timeArr![4] + ":" + timeArr![5];

    return timeStr;
  }
}