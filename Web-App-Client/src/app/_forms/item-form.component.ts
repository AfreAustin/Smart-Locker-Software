import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';
import { Item, Locker } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-item-form',
  template: `
  <form class="admin-form" autocomplete="off" [formGroup]="itemForm" (ngSubmit)="submitForm()">
    <div class="admin-question">
      <input class="admin-text" type="text" formControlName="itemName" placeholder="Item Name" required>
    
      <div *ngIf="itemName.invalid && (itemName.dirty || itemName.touched)">
        <div class="admin-error-msg" *ngIf="itemName.errors?.['required']"> required </div>
        <div class="admin-error-msg" *ngIf="itemName.errors?.['minlength']"> must be at least 3 characters </div>
      </div>
    </div>

    <div class="admin-question">
      <textarea class="admin-textarea" formControlName="itemDesc" placeholder="Item Description" required></textarea>

      <div *ngIf="itemDesc.invalid && (itemDesc.dirty || itemDesc.touched)">
        <div class="admin-error-msg" *ngIf="itemDesc.errors?.['required']"> required </div>
      </div>
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
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/drill.svg">
            <img class="admin-radio-img" src="assets/icons/items/drill.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/hammer-claw.svg">
            <img class="admin-radio-img" src="assets/icons/items/hammer-claw.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/plier-channellock.svg">
            <img class="admin-radio-img" src="assets/icons/items/plier-channellock.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/plier-needlenose.svg">
            <img class="admin-radio-img" src="assets/icons/items/plier-needlenose.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/saw-circular.svg">
            <img class="admin-radio-img" src="assets/icons/items/saw-circular.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/screwdriver-flathead.svg">
            <img class="admin-radio-img" src="assets/icons/items/screwdriver-flathead.svg">
          </label>
          <label class="admin-radio-item"> 
            <input type="radio" formControlName="itemIcon" value="assets/icons/items/wrench-adjustable.svg">
            <img class="admin-radio-img" src="assets/icons/items/wrench-adjustable.svg">
          </label>
        </div>
      </label>
    </div>

    <button class="bubble-button" type="submit" [disabled]="itemForm.invalid"> Submit </button>
  </form>
  `
})
export class ItemFormComponent implements OnInit {
  public itemForm: FormGroup = new FormGroup({});
  public lockers$: Observable<Locker[]> = new Observable();

  constructor(
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService
  ) { }
  @Input()
  initialState: BehaviorSubject<Item> = new BehaviorSubject({});
  @Output()
  formValuesChanged = new EventEmitter<Item>();
  @Output()
  formSubmitted = new EventEmitter<Item>();

  get itemName() { return this.itemForm.get('itemName')!; }
  get itemDesc() { return this.itemForm.get('itemDesc')!; }
  get itemIcon() { return this.itemForm.get('itemIcon')!; }
  get itemLock() { return this.itemForm.get('itemLock')!; }
  get itemFree() { return this.itemForm.get('itemFree')!; }

  ngOnInit() {
    this.lockers$ = this.databaseService.getLockers();

    this.initialState.subscribe(item => {
      this.itemForm = this.formBuilder.group({
        itemName: [ item.itemName, [Validators.required, Validators.minLength(3)] ],
        itemDesc: [ item.itemDesc, [Validators.required] ],
        itemIcon: [ item.itemIcon, [Validators.required] ],
        itemLock: [ item.itemLock, [Validators.required] ],
        itemFree: [ item.itemFree, [Validators.required] ]
      });
    });

    this.itemForm.valueChanges.subscribe((val) => { this.formValuesChanged.emit(val); });
  }

  submitForm() { this.formSubmitted.emit(this.itemForm.value); }
}