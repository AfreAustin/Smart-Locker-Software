import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { DatabaseService } from '../_services/database.service';
import { Account, Item, Reservation } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-profile',
  template: `
  <div class="profile">
    <p class="material-icons profile-img"> account_circle </p>
    <p class="profile-detail" *ngIf="(user$ | async) as user">
      {{ user.foreName + " " + user.lastName }}
      <br> {{ user.userName }}
      <br> {{ "RFID No. " + user.userRFID }}
      <br> {{ user.userType == "manager" ? 'Manager' : '' }}
    </p>
  </div>

  <h3> Reservations </h3>

  <div>
    <mat-table class="mat-elevation-z8 profile-table" [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="itemID">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
        <mat-cell *matCellDef="let reservation"> <p> {{reservation.itemID}} </p> </mat-cell>
      </ng-container>
      
      <ng-container matColumnDef="strtTime">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Start </mat-header-cell>
        <mat-cell *matCellDef="let reservation"> <p> {{parseTime(reservation.strtTime)}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="stopTime">
        <mat-header-cell *matHeaderCellDef mat-sort-header> End </mat-header-cell>
        <mat-cell *matCellDef="let reservation">
          <p>  {{parseTime(reservation.stopTime)}} </p>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="pickedUp">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Action </mat-header-cell>
        <mat-cell *matCellDef="let reservation"> 
          <p *ngIf="reservation.pickedUp == false"> <a (click)="processCheckout( reservation )"> Pick Up </a> </p>
          <p *ngIf="reservation.pickedUp == true"> <a (click)="processCheckout( reservation )"> Return </a> </p>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['itemID', 'strtTime', 'stopTime', 'pickedUp']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['itemID', 'strtTime', 'stopTime', 'pickedUp'];"></mat-row>
    </mat-table>

    <mat-paginator class="mat-elevation-z8" [pageSize]="5" [pageSizeOptions]="[5, 10, 20]" [showFirstLastButtons]="true"></mat-paginator>
  </div>
  `
})
export class ProfileComponent implements OnInit {
  private reservations$: Observable<Reservation[]> = new Observable();
  
  public user$: Observable<Account> = new Observable();
  public dataSource = new MatTableDataSource();
  
  constructor(
    private router: Router,
    private databaseService: DatabaseService
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngOnInit(): void { 
    let userID: string | undefined = localStorage.getItem('userID')?.toString();
    if (userID) { 
      this.user$ = this.databaseService.getAccount(userID);

      this.reservations$ = this.databaseService.categorize(userID);
      this.reservations$.subscribe({
        next: (data) => { this.dataSource.data = data},
        error: (err) => {console.log(err)} 
      })
    }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  // parse times
  parseTime(time: Number | undefined): String {
    let timeStr = time?.toString();
    let dateRgx = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;

    if (timeStr) {
      let dateSet: Date = new Date(timeStr.replace(dateRgx, '$1-$2-$3T$4:$5:00'));
      return dateSet.toLocaleString('en-NA', {year: '2-digit', month: 'short' , day:'2-digit', hour: '2-digit', minute:'2-digit', hour12:false});
    } else return "Bad Date";
  }

  processCheckout(reservation: Reservation) {
    // server dies here when cannot make connection, figure out how to prevent express server from crashing (fatal error?)
    // unlock the reservation item's locker
    /*
    this.databaseService.unlockLocker(reservation.itemID!).subscribe({
      next: (res) => { console.log(res); },
      error: (err) => { console.log(err); }
    });
    */
   
    // update database
    let id: string = reservation._id!;
    
    this.databaseService.checkOut(id, reservation).subscribe({
      next: () => { this.router.navigate(['/customer/survey', reservation._id]); },
      error: (err) => { console.log(err.error);}
    });
  }
}