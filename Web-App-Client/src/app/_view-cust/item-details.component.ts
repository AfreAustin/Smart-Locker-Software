import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

import { DatabaseService } from 'src/app/_services/database.service';
import { Item, Reservation } from 'src/app/_resources/interfaces';

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
      <form [formGroup]="reserveForm" (ngSubmit)="TESTreserve(item._id!)">
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
export class ItemDetailsComponent implements OnInit, OnDestroy {
  private reservation$: Observable<Reservation[]> = new Observable();
  private checkSub: Subscription = new Subscription();
  private makeSub: Subscription = new Subscription();
  item$: Observable<Item> = new Observable();
  reserveForm: FormGroup = new FormGroup({});
  message: string = '';

  constructor(
    private router: Router,
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
  ngOnDestroy(): void {
    this.checkSub.unsubscribe();
    this.makeSub.unsubscribe();
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
  TESTreserve(item: string) {
    if (item) {
      let strt = this.convertDate(this.strtTime.getRawValue());
      let stop = this.convertDate(this.stopTime.getRawValue());

      
    }
  }

  reserve(item: Item) {
    this.reservation$ = this.databaseService.getReservations();
    this.checkSub = this.reservation$.subscribe( reservations => {
      let strt = this.convertDate(this.strtTime.getRawValue());
      let stop = this.convertDate(this.stopTime.getRawValue());

      if (strt >= stop) this.message = 'Start Time cannot be before End Time';
      else {
        let available: boolean = false;
        let seen: boolean = false;
        let iter: number = 1;

        if (reservations.length == 0) available = true;
        else {
          for (let reserve of reservations) {
            if (available == true) continue;

            if ( (iter == reservations.length && available == false && seen == true) ||
              (reserve.itemName === item.itemName && reserve?.strtTime && strt < reserve.strtTime && stop <= reserve.strtTime) || 
              (reserve.itemName === item.itemName && reserve?.stopTime && strt >= reserve.stopTime && stop > reserve.stopTime)
            ) { 
              available = true;
              seen = true;
            } else if (reserve.itemName === item.itemName ) seen = true;
            
            iter = iter + 1;
          }
        }

        if (available == true) {
          let rsrv: Reservation = {
            "itemName": item.itemName,
            "itemLock": item.itemLock,
            "userName": localStorage.getItem("userName")?.toString(),
            "strtTime": strt,
            "stopTime": stop,
            "pickedUp": false
          };

          this.makeSub = this.databaseService.createReservation(rsrv).subscribe();
          this.router.navigate(['/customer/profile']);
        } else this.message = "Item unavailable at that time";
      }
    });
  }
}