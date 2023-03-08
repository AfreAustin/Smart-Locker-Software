import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';

@Component({
  selector: 'app-add-element',
  template: `
  <div *ngIf="element == 'acct'"> 
    <h2> Add a New Account </h2>
    <app-account-form (formSubmitted)="addElement($event)"></app-account-form>
  </div>

  <div *ngIf="element == 'item'">
    <h2> Add a New Item </h2>
    <app-item-form (formSubmitted)="addElement($event)"></app-item-form>
  </div>

  <div *ngIf="element == 'lock'">
    <h2> Add a New Locker </h2>
    <app-locker-form (formSubmitted)="addElement($event)"></app-locker-form>
  </div>

  <div *ngIf="element == 'rcrd'">
    <h2> Add a New Record </h2>
    <app-record-form (formSubmitted)="addElement($event)"></app-record-form>
  </div>

  <div *ngIf="element == 'rsrv'">
    <h2> Add a New Reservation </h2>
    <app-reservation-form (formSubmitted)="addElement($event)"></app-reservation-form>
  </div>

  <h2 routerLink="/manage/home"> Cancel </h2>
  `
})
export class AddElementComponent implements OnInit, OnDestroy{
  private addSub : Subscription = new Subscription();
  element: string = "";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService
  ) { }

  ngOnInit(): void {
    const elemFromPath = this.activatedRoute.snapshot.paramMap.get('element');
    if (!elemFromPath) alert('No element provided');
    else this.element = elemFromPath;
  }
  ngOnDestroy(): void {
    this.addSub.unsubscribe();
  }

  addElement(event : any) {
    switch (this.element) {
      case "acct":
        this.addSub = this.databaseService.createAccount(event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => { 
            alert("Failed to create account");
            console.error(error);
          }
        });
        break;
      case "item":
        this.addSub = this.databaseService.createItem(event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert("Failed to create item");
            console.error(error);
          }
        });
        break;
      case "lock":
        this.addSub = this.databaseService.createLocker(event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert("Failed to create locker");
            console.error(error);
          }
        });
        break;
      case "rcrd":
        this.addSub = this.databaseService.createRecord(event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert("Failed to create record");
            console.error(error);
          }
        });
        break;
      case "rsrv":
        this.addSub = this.databaseService.createReservation(event).subscribe({
          next: () => { this.router.navigate(['/manage/home']); },
          error: (error) => {
            alert("Failed to create reservation");
            console.error(error);
          }
        });
        break;
      default: throw new Error('Unknown element')
    }
  }
}