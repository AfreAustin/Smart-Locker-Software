import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { Item } from 'src/app/_interfaces/item';
import { Locker } from 'src/app/_interfaces/locker';
import { DatabaseService } from 'src/app/_services/database.service';

@Component({
  selector: 'app-item-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="itemForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <input type="text" formControlName="itemName" placeholder="Item Name" required>
    
      <div class="admin-error" *ngIf="itemName.invalid && (itemName.dirty || itemName.touched)">
        <div class="admin-error-msg" *ngIf="itemName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="itemName.errors?.['minlength']"> must be at least 3 characters </div>
      </div>
    </div>

    <div class="admin-question">
      <textarea class="admin-textarea" rows="5" cols="65" formControlName="itemDesc" placeholder="Item Description" required></textarea>

      <div *ngIf="itemDesc.invalid && (itemDesc.dirty || itemDesc.touched)">
        <div class="admin-error-msg" *ngIf="itemDesc.errors?.['required']"> required </div>
      </div>
    </div>
    
    <div class="admin-question">
      <label for="itemReqs">Requirements:
        <select id="itemReqs" formControlName="itemReqs">
          <option value="none"> None </option>
          <option value="some"> Some </option>
        </select>
      </label>
    </div>

    <div class="admin-question">
      <label> Available:
        <div class="admin-radio">
          <label class="admin-radio-item"> <input type="radio" formControlName="itemFree" [value]="true"> Yes </label>
          <label class="admin-radio-item"> <input type="radio" formControlName="itemFree" [value]="false"> No </label>
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
      <label for="itemIcon"> Icon: 
        <div class="admin-radio">
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/drill.svg">
            <img class="admin-radio-img" src="assets/item-icons/drill.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/hammer-claw.svg">
            <img class="admin-radio-img" src="assets/item-icons/hammer-claw.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/plier-channellock.svg">
            <img class="admin-radio-img" src="assets/item-icons/plier-channellock.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/plier-needlenose.svg">
            <img class="admin-radio-img" src="assets/item-icons/plier-needlenose.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/saw-circular.svg">
            <img class="admin-radio-img" src="assets/item-icons/saw-circular.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/screwdriver-flathead.svg">
            <img class="admin-radio-img" src="assets/item-icons/screwdriver-flathead.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/item-icons/wrench-adjustable.svg">
            <img class="admin-radio-img" src="assets/item-icons/wrench-adjustable.svg">
          </label>
        </div>
      </label>
    </div>

    <button class="bubble-button" type="submit" [disabled]="itemForm.invalid"> Create </button>
  </form>
  `
})
export class ItemFormComponent implements OnInit {
  lockers$: Observable<Locker[]> = new Observable();

  @Input()
  initialState: BehaviorSubject<Item> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Item>();
  @Output()
  formSubmitted = new EventEmitter<Item>();

  itemForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService
  ) { }

  get itemName() { return this.itemForm.get('itemName')!; }
  get itemDesc() { return this.itemForm.get('itemDesc')!; }
  get itemIcon() { return this.itemForm.get('itemIcon')!; }
  get itemLock() { return this.itemForm.get('itemLock')!; }
  get itemReqs() { return this.itemForm.get('itemReqs')!; }
  get itemFree() { return this.itemForm.get('itemFree')!; }

  ngOnInit() {
    this.lockers$ = this.databaseService.getLockers();

    this.initialState.subscribe(item => {
      this.itemForm = this.fb.group({
        itemName: [ item.itemName, [Validators.required, Validators.minLength(3)] ],
        itemDesc: [ item.itemDesc, [Validators.required] ],
        itemIcon: [ item.itemIcon, [Validators.required, Validators.minLength(3)] ],
        itemLock: [ item.itemLock, [Validators.required ] ],
        itemReqs: [ item.itemReqs, [Validators.required] ],
        itemFree: [ item.itemFree, [Validators.required] ]
      });
    });

    // changed state of form
    this.itemForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  // emits values in form
  submitForm() {
    this.formSubmitted.emit(this.itemForm.value);
  }
}