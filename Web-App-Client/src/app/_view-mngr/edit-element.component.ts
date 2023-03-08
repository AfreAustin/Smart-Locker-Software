import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';
import { Account } from '../_interfaces/account';
import { Item } from '../_interfaces/item';
import { Locker } from '../_interfaces/locker';
import { Record } from '../_interfaces/record';
import { Reservation } from '../_interfaces/reservation';

@Component({
  selector: 'app-edit-element',
  template: `
  <div *ngIf="element == 'acct'">
    <h2> Edit an Existing Account </h2>
    <app-account-form [initialState]="account" (formSubmitted)="editElement($event)"></app-account-form>
  </div>

  <div *ngIf="element == 'item'">
    <h2> Edit an Existing Item </h2>
    <app-item-form [initialState]="item" (formSubmitted)="editElement($event)"></app-item-form>
  </div>

  <div *ngIf="element == 'lock'">
    <h2> Edit an Existing Locker </h2>
    <app-locker-form [initialState]="locker" (formSubmitted)="editElement($event)"></app-locker-form>
  </div>

  <div *ngIf="element == 'rcrd'">
    <h2> Edit an Existing Record </h2>
    <app-record-form [initialState]="record" (formSubmitted)="editElement($event)"></app-record-form>
  </div>

  <div *ngIf="element == 'rsrv'">
    <h2> Edit an Existing Reservation </h2>
    <app-reservation-form [initialState]="reservation" (formSubmitted)="editElement($event)"></app-reservation-form>
  </div>

  <h2 routerLink="/manage/home"> Cancel </h2>
  `
})
export class EditElementComponent implements OnInit, OnDestroy {
  private getSub : Subscription = new Subscription();
  private editSub : Subscription = new Subscription();
  element: string = "";

  account: BehaviorSubject<Account> = new BehaviorSubject({});
  item: BehaviorSubject<Item> = new BehaviorSubject({});
  locker: BehaviorSubject<Locker> = new BehaviorSubject({});
  record: BehaviorSubject<Record> = new BehaviorSubject({});
  reservation: BehaviorSubject<Reservation> = new BehaviorSubject({});
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
  ) { }

  // initially find account and track form changes
  ngOnInit() {
    const elemFromPath = this.activatedRoute.snapshot.paramMap.get('element');
    if (!elemFromPath) alert('No element provided');
    else this.element = elemFromPath;

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) alert('No id provided');
  
    switch (this.element) {
      case "acct":
        this.getSub = this.databaseService.getAccount(id !).subscribe((account) => { this.account.next(account); });
        break;
      case "item":
        this.getSub = this.databaseService.getItem(id !).subscribe((item) => { this.item.next(item); });
        break;
      case "lock":
        this.getSub = this.databaseService.getLocker(id !).subscribe((locker) => { this.locker.next(locker); });
        break;
      case "rcrd":
        this.getSub = this.databaseService.getRecord(id !).subscribe((record) => { this.record.next(record); });
        break;
      case "rsrv":
        this.getSub = this.databaseService.getReservation(id !).subscribe((reservation) => { this.reservation.next(reservation); });
        break;
      default: throw new Error('Unknown element, cannot get')
    }
  }
  ngOnDestroy(): void {
    this.getSub.unsubscribe();
    this.editSub.unsubscribe();
  }

  editElement(event: any) {
    switch (this.element) {
      case "acct":
        this.editSub = this.databaseService.updateAccount(this.account.value._id || '', event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert('Failed to update account');
            console.error(error);
          }
        });
        break;
      case "item":
        this.editSub = this.databaseService.updateItem(this.item.value._id || '', event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert('Failed to update item');
            console.error(error);
          }
        });
        break;
      case "lock":
        this.editSub = this.databaseService.updateLocker(this.locker.value._id || '', event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert('Failed to update locker');
            console.error(error);
          }
        });
        break;
      case "rcrd":
        this.editSub = this.databaseService.updateRecord(this.record.value._id || '', event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert('Failed to update record');
            console.error(error);
          }
        });
        break;
      case "rsrv":
        this.editSub = this.databaseService.updateReservation(this.reservation.value._id || '', event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert('Failed to update reservations');
            console.error(error);
          }
        });
        break;
      default: throw new Error('Unknown element, cannot get')
    }
  }
}