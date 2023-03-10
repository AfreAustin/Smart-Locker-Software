import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { Record } from 'src/app/_interfaces/record';
import { Item } from 'src/app/_interfaces/item';
import { Account } from 'src/app/_interfaces/account';
import { Locker } from 'src/app/_interfaces/locker';
import { DatabaseService } from 'src/app/_services/database.service';

@Component({
  selector: 'app-record-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="recordForm" (ngSubmit)="submitForm()">
  <div class="admin-question">
    <label> Account: 
      <div class="admin-radio">
        <div *ngFor="let account of accounts$ | async">
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="userName" [value]="account.userName"> 
            {{account.userName}}
          </label>
        </div>
      </div>
    </label>
  </div>

  <div class="admin-question">
    <label> Item: 
      <div class="admin-radio">
        <div *ngFor="let item of items$ | async">
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemName" [value]="item.itemName"> 
            <p>{{"(" + item.itemLock + ") " + item.itemName}}</p>
          </label>
        </div>
      </div>
    </label>
  </div>

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
    <input class="admin-text" type="text" formControlName="rsrvtion" placeholder="Reservation ID" required>

    <div *ngIf="rsrvtion.invalid && (rsrvtion.dirty || rsrvtion.touched)">
      <div class="admin-error-msg" *ngIf="rsrvtion.errors?.['required']"> required </div>
    </div>
  </div>

  <div class="admin-question">
    <label>Start Time: </label>
    <input class="admin-dt-local" type="datetime-local" formControlName="strtTime" required>

    <div *ngIf="strtTime.invalid && (strtTime.dirty || strtTime.touched)">
      <div class="admin-error-msg" *ngIf="strtTime.errors?.['required']"> required </div>
    </div>
  </div>

  <div class="admin-question">
    <label>Stop Time:  </label>
    <input class="admin-dt-local" type="datetime-local" formControlName="stopTime" required>

    <div *ngIf="stopTime.invalid && (stopTime.dirty || stopTime.touched)">
      <div class="admin-error-msg" *ngIf="stopTime.errors?.['required']"> required </div>
    </div>
  </div>

  <div class="admin-question">
    <label> Event:
      <div class="admin-radio">
        <label class="admin-radio-item"> <input type="radio" formControlName="pickedUp" [value]="true"> Pick Up </label>
        <label class="admin-radio-item"> <input type="radio" formControlName="pickedUp" [value]="false"> Return </label>
      </div>
    </label>
  </div>

  <div class="admin-question">
      <label>Item Condition: </label>
    </div>
    <div class="survey-radio">
      <label> Completely Broken <br>
        <input type="radio" formControlName="itemCond" [value]="1"> <span class="survey-mark"></span>
      </label>
      <label> Mostly Broken <br>
        <input type="radio" formControlName="itemCond" [value]="2"> <span class="survey-mark"></span>
      </label>
      <label> Moderately Broken <br>
        <input type="radio" formControlName="itemCond" [value]="3"> <span class="survey-mark"></span>
      </label>
      <label> Somewhat Broken <br>
        <input type="radio" formControlName="itemCond" [value]="4"> <span class="survey-mark"></span>
      </label>
      <label> Slightly Broken <br>
        <input type="radio" formControlName="itemCond" [value]="5"> <span class="survey-mark"></span>
      </label>
      <label> Slightly Fine <br>
        <input type="radio" formControlName="itemCond" [value]="6"> <span class="survey-mark"></span>
      </label>
      <label> Somewhat Fine <br>
        <input type="radio" formControlName="itemCond" [value]="7"> <span class="survey-mark"></span>
      </label>
      <label> Moderately Fine <br>
        <input type="radio" formControlName="itemCond" [value]="8"> <span class="survey-mark"></span>
      </label>
      <label> Mostly Fine <br>
        <input type="radio" formControlName="itemCond" [value]="9"> <span class="survey-mark"></span>
      </label>
      <label> Completely Fine <br>
        <input type="radio" formControlName="itemCond" [value]="10"> <span class="survey-mark"></span>
      </label>
    </div>

    <div>
      <label>Comments: <br>
        <textarea class="survey-textarea" formControlName="comments" placeholder="comments"></textarea>
      </label>
    </div>    

  <button class="bubble-button" type="submit" [disabled]="recordForm.invalid">Add</button>
  </form>
  ` 
})
export class RecordFormComponent implements OnInit {
  items$: Observable<Item[]> = new Observable();
  accounts$: Observable<Account[]> = new Observable();
  lockers$: Observable<Locker[]> = new Observable();

  @Input()
  initialState: BehaviorSubject<Record> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Record>();
  @Output()
  formSubmitted = new EventEmitter<Record>();

  recordForm: FormGroup = new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService) { }

  // get record details
  get rsrvtion() { return this.recordForm.get('rsrvtion')!; }
  get itemName() { return this.recordForm.get('itemName')!; }
  get itemLock() { return this.recordForm.get('itemLock')!;}
  get userName() { return this.recordForm.get('userName')!; }
  get strtTime() { return this.recordForm.get('strtTime')!; }
  get stopTime() { return this.recordForm.get('stopTime')!; }
  get pickedUp() { return this.recordForm.get('pickedUp')!; }
  get itemCond() { return this.recordForm.get('itemCond')!; }
  get comments() { return this.recordForm.get('comments')!; }
  
  // load current state of form
  ngOnInit() {
    this.items$ = this.databaseService.getItems();
    this.accounts$ = this.databaseService.getAccounts();
    this.lockers$ = this.databaseService.getLockers();

    // initial state of form
    this.initialState.subscribe(record => {
      this.recordForm = this.formBuilder.group({
        rsrvtion: [ record.rsrvtion, [Validators.required] ],
        itemName: [ record.itemName, [Validators.required, Validators.minLength(3)] ],
        itemLock: [ record.itemLock, [Validators.required] ],
        userName: [ record.userName, [Validators.required, Validators.minLength(3)] ],
        strtTime: [ record.strtTime, [Validators.required] ],
        stopTime: [ record.stopTime, [Validators.required] ],
        pickedUp: [ record.pickedUp, [Validators.required] ],
        itemCond: [ record.itemCond, [Validators.required] ],
        comments: [ record.comments ]
      });
    });

    // changed state of form
    this.recordForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  // emits values in form
  submitForm() { this.formSubmitted.emit(this.recordForm.value); }
}