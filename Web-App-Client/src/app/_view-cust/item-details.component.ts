import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

import { DatabaseService } from 'src/app/_services/database.service';
import { Item } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-item-details',
  template: `
  <h2 routerLink="/customer/items" class="item-detail-nav"> Back </h2> 

  <div class="item-detail" *ngIf="(item$ | async) as item">
    <img [src]="item.itemIcon">
    <div>
      <h1> {{ item.itemName }} </h1>
      <p> &nbsp; {{ item.itemDesc }} </p>
      <br>
      <form [formGroup]="reserveForm" (ngSubmit)="reserve(item._id!)">
        {{ (item.itemFree == true) ? 'Available' : 'Not Available' }} for Pickup
        <div>
          <label> Start Time </label>
          <input class="item-detail-input" type="datetime-local" formControlName="strtTime">
        </div>
        <div>
          <label> End Time &nbsp;&nbsp; </label>
          <input class="item-detail-input" type="datetime-local" formControlName="stopTime">
        </div>
        <button class="bubble-button" type="submit" [disabled]="reserveForm.invalid"> Reserve </button>
      </form>
      <p class="error-msg"> {{message}} </p>
    </div>
  </div>
  `
})
export class ItemDetailsComponent implements OnInit {
  public reserveForm: FormGroup = new FormGroup({});
  public item$: Observable<Item> = new Observable();
  public message: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService
  ) { }
  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) alert('No id provided');
    else this.item$ = this.databaseService.getItem(id);

    this.reserveForm = this.formBuilder.group({
      strtTime: ['', Validators.required],
      stopTime: ['', Validators.required]
    });
  }

  get strtTime() { return this.reserveForm.get('strtTime')!; }
  get stopTime() { return this.reserveForm.get('stopTime')!; }

  /* 
  *  Convert date to store into database 
  *  from string YYYY-MM-DDTHH:MM to number YYYYMMDDHHMM
  */
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

  /*
  *  Reserve item for user if it is available
  *  Get reservations, then check against start and stop times for conficts
  *  If there are time conflicts, show message with conflict  
  */
  reserve(item: string) {
    if (item) {
      let strt = this.convertDate(this.strtTime.getRawValue());
      let stop = this.convertDate(this.stopTime.getRawValue());
      let body = {
        reqUser: localStorage.getItem("userID")?.toString(),
        reqStrt: strt,
        reqStop: stop
      }

      this.databaseService.reserve(item, body).subscribe({
        next: () => { this.message = "Reservation Created"; },
        error: (err) => { this.message = err.error; }
      });
    }
  }
}