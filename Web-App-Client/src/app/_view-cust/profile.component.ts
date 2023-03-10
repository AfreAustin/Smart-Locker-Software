import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Item } from '../_interfaces/item';
import { Reservation } from 'src/app/_interfaces/reservation';
import { DatabaseService } from '../_services/database.service';

@Component({
  selector: 'app-profile',
  template: `
  <div class="profile">
    <p class="material-icons profile-img" > account_circle </p>
    <p class="profile-detail">
      {{userInfo[1] + ' ' + userInfo[2]}} <br>
      {{userInfo[0]}} <br>
      RFID No. {{userInfo[3]}} <br>
      ID {{userInfo[4]}} <br>
      {{ userType == "true" ? 'Manager' : '' }}
    </p>
  </div>

  <h3>Reservations</h3>

  <div>
    <mat-table class="mat-elevation-z8 profile-table" [dataSource]="dataSource" matSort>
      <ng-container matColumnDef="itemName">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
        <mat-cell *matCellDef="let reservation"> <p> {{reservation.itemName}} </p> </mat-cell>
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
          <p *ngIf="reservation.pickedUp == false"> <a (click)="processCheckout( false, reservation )"> Pick Up </a> </p>
          <p *ngIf="reservation.pickedUp == true"> <a (click)="processCheckout( true, reservation )"> Return </a> </p>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>

    <mat-paginator class="mat-elevation-z8 profile-paginator" [pageSize]="5" [pageSizeOptions]="[5, 10, 20]" [showFirstLastButtons]="true"></mat-paginator>
  </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  private reservations$: Observable<Reservation[]> = new Observable();
  private items$: Observable<Item[]> = new Observable();
  private categorizeSub: Subscription = new Subscription();
  private itemIterSub: Subscription = new Subscription();
  private updateItemSub: Subscription = new Subscription();
  private updateRsrvSub: Subscription = new Subscription();
  private unlockSub: Subscription = new Subscription();
  userInfo: string[] = [];
  userType: string | undefined = "";
  reservations: Reservation[] = [];
  displayedColumns = ['itemName', 'strtTime', 'stopTime', 'pickedUp'];
  dataSource= new MatTableDataSource();

  constructor(
    private router: Router,
    private databaseService: DatabaseService
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngOnInit(): void { 
    this.reservations$ = this.databaseService.getReservations();

    this.userInfo = this.getUserInfoFromCache();
    this.userType = localStorage.getItem("isManager")?.toString();
    this.categorizeReservations(this.userInfo[0]);
  }
  ngOnDestroy(): void { 
    this.categorizeSub.unsubscribe();
    this.itemIterSub.unsubscribe();
    this.updateRsrvSub.unsubscribe();
    this.updateItemSub.unsubscribe();
    this.unlockSub.unsubscribe();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  // categorize reservations based on whether it is a Pick Up or Return
  categorizeReservations(username: string): void {
    this.categorizeSub = this.reservations$.subscribe( reservations => {
      for (let reserve of reservations) if (reserve.userName == username) this.reservations.push(reserve);
      this.dataSource.data = this.reservations;
    });
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

  private getUserInfoFromCache(): string[] {
    let cacheInfo = localStorage.getItem("userInfo")?.toString();

    if (cacheInfo) return cacheInfo.split(" ");
    else return [];
  }

  processCheckout(pickedUp: boolean, reservation: Reservation) {
    //this.openLocker(reservation.itemLock!);
    this.updateDatabase(pickedUp, reservation);
  }

  openLocker(lockerID: string) : void {
    let body: any = {
      lockerID: lockerID,
      command: "UL"
    };

    // server dies here when cannot make connection, figure out how to prevent express server from crashing (fatal error?)
    this.unlockSub = this.databaseService.addQueue(body).subscribe();
  }

  updateDatabase(pickedUp: boolean, reservation : Reservation) : void {
    this.items$ = this.databaseService.getItems();
    this.itemIterSub = this.items$.subscribe( items => {
      for (let item of items) {
        if (reservation.itemName == item.itemName) {
          let rsrvItem : Item = {
            "itemName": item.itemName,
            "itemDesc": item.itemDesc,
            "itemIcon": item.itemIcon,
            "itemLock": item.itemLock,
            "itemReqs": item.itemReqs,
            "itemFree": item.itemFree
          }

          let index : number = this.reservations.indexOf(reservation);
          if (index > -1) {
            let rsrv: Reservation = {
              "itemName": reservation.itemName,
              "userName": reservation.userName,
              "strtTime": reservation.strtTime,
              "stopTime": reservation.stopTime,
              "pickedUp": reservation.pickedUp
            }
    
            if (pickedUp == false) {
              let dateTime = new Date();
              let dateSet : string = dateTime.toJSON();
              let dateNum : Number = parseInt(dateSet.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/, '$1$2$3$4$5')) - 600;
  
              if ((item.itemFree == true)  || (reservation.strtTime && reservation.strtTime < dateNum)) {
                rsrv.pickedUp = true;
                rsrvItem.itemFree = false;

                this.updateRsrvSub = this.databaseService.updateReservation(this.reservations[index]._id || '', rsrv).subscribe();
                this.updateItemSub = this.databaseService.updateItem(item._id || '', rsrvItem).subscribe();
                this.router.navigate(['/customer/survey', this.reservations[index]._id]);
              } else window.location.reload();
            } else if (pickedUp == true) {
              rsrv.pickedUp = false;
              rsrvItem.itemFree = true;

              this.updateRsrvSub = this.databaseService.updateReservation(this.reservations[index]._id || '', rsrv).subscribe();
              this.updateItemSub = this.databaseService.updateItem(item._id || '', rsrvItem).subscribe();
              this.router.navigate(['/customer/survey', this.reservations[index]._id]);
            } else throw new Error('Unable to read event');
          }
        }
      }
    });
  }
}