import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';
import { Account, Item, Record } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-record-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="recordForm" (ngSubmit)="submitForm()">
  <div class="admin-question">
    <label> Account: 
      <div class="admin-radio">
        <div *ngFor="let account of accounts$ | async">
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="userID" [value]="account.userName"> 
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
            <input type="radio" formControlName="itemID" [value]="item.itemName"> 
            <p>{{item.itemName}}</p>
          </label>
        </div>
      </div>
    </label>
  </div>

  <div class="admin-question">
    <label>Start Time: </label>
    <input class="admin-dt-local" type="datetime-local" formControlName="expect" required>

    <div *ngIf="expect.invalid && (expect.dirty || expect.touched)">
      <div class="admin-error-msg" *ngIf="expect.errors?.['required']"> required </div>
    </div>
  </div>

  <div class="admin-question">
    <label>Stop Time:  </label>
    <input class="admin-dt-local" type="datetime-local" formControlName="actual" required>

    <div *ngIf="actual.invalid && (actual.dirty || actual.touched)">
      <div class="admin-error-msg" *ngIf="actual.errors?.['required']"> required </div>
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

  <button class="bubble-button" type="submit" [disabled]="recordForm.invalid">Submit</button>
  </form>
  ` 
})
export class RecordFormComponent implements OnInit {
  public recordForm: FormGroup = new FormGroup({});
  public accounts$: Observable<Account[]> = new Observable();
  public items$: Observable<Item[]> = new Observable();

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService
  ) {}
  @Input()
  initialState: BehaviorSubject<Record> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Record>();
  @Output()
  formSubmitted = new EventEmitter<Record>();

  get itemID() { return this.recordForm.get('itemID')!; }
  get userID() { return this.recordForm.get('userID')!; }
  get expect() { return this.recordForm.get('expect')!; }
  get actual() { return this.recordForm.get('actual')!; }
  get pickedUp() { return this.recordForm.get('pickedUp')!; }
  get itemCond() { return this.recordForm.get('itemCond')!; }
  get comments() { return this.recordForm.get('comments')!; }
  
  ngOnInit() {
    this.items$ = this.databaseService.getItems();
    this.accounts$ = this.databaseService.getAccounts();

    this.initialState.subscribe(record => {
      this.recordForm = this.formBuilder.group({
        itemID: [ record.itemID, [Validators.required] ],
        userID: [ record.userID, [Validators.required] ],
        expect: [ record.expect, [Validators.required] ],
        actual: [ record.actual, [Validators.required] ],
        pickedUp: [ record.pickedUp, [Validators.required] ],
        itemCond: [ record.itemCond, [Validators.required] ],
        comments: [ record.comments ]
      });
    });

    this.recordForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  submitForm() { this.formSubmitted.emit(this.recordForm.value); }
}