import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { DatabaseService } from '../_services/database.service';
import { Account, Item, Locker, Record, Reservation } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-manager-home',
  template: `
  <h1> Admin: {{ custName }} </h1>
  <div>
    <button [ngClass]="{'admin-tab-selected' : dataSrc == 'acct', 'admin-tab' : dataSrc != 'acct'}" (click)="changeTableDataSrc('acct')"> Accounts </button>
    <button [ngClass]="{'admin-tab-selected' : dataSrc == 'item', 'admin-tab' : dataSrc != 'item'}" (click)="changeTableDataSrc('item')"> Items </button>
    <button [ngClass]="{'admin-tab-selected' : dataSrc == 'lock', 'admin-tab' : dataSrc != 'lock'}" (click)="changeTableDataSrc('lock')"> Lockers </button>
    <button [ngClass]="{'admin-tab-selected' : dataSrc == 'rsrv', 'admin-tab' : dataSrc != 'rsrv'}" (click)="changeTableDataSrc('rsrv')"> Reservations </button>
    <button [ngClass]="{'admin-tab-selected' : dataSrc == 'rcrd', 'admin-tab' : dataSrc != 'rcrd'}" (click)="changeTableDataSrc('rcrd')"> Records </button>

    <mat-table class="mat-elevation-z8 admin-table" [dataSource]="dataSource" matSort multiTemplateDataRows>
      <ng-container matColumnDef="userName">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Email </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.userName}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="userType">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Type </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.userType}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="lastName">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.lastName + ', ' + element.foreName }} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="userRFID">
        <mat-header-cell *matHeaderCellDef mat-sort-header> RFID </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.userRFID}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemFree">
        <mat-header-cell *matHeaderCellDef mat-sort-header> FREE </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.itemFree == true ? 'Y' : 'N'}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemIcon">
        <mat-header-cell *matHeaderCellDef> Icon </mat-header-cell>
        <mat-cell *matCellDef="let element"> <img class="admin-table-icon" [src]="element.itemIcon"> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemName">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Item </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.itemName}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemLock">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Locker </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.itemLock}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemDesc">
        <mat-header-cell *matHeaderCellDef> Description </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{element.itemDesc}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="lockName">
        &nbsp; <mat-header-cell *matHeaderCellDef mat-sort-header> Name </mat-header-cell>
        &nbsp; <mat-cell *matCellDef="let element"> <p> {{element.lockName}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="lockOpen">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Last Opened </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{parseTime(element.lastOpen)}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="lockShut">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Last Closed </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{parseTime(element.lastShut)}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="pickedUp">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Event </mat-header-cell>
        <mat-cell *matCellDef="let element"> 
          <p *ngIf="this.dataSrc == 'rsrv'"> {{element.pickedUp == false ? 'Pickup' : 'Return'}} </p> 
          <p *ngIf="this.dataSrc == 'rcrd'"> {{element.pickedUp == true ? 'Pickup' : 'Return'}} </p> 
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="strtTime">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Start </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{parseTime(element.strtTime)}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="stopTime">
        <mat-header-cell *matHeaderCellDef mat-sort-header> End </mat-header-cell>
        <mat-cell *matCellDef="let element"> <p> {{parseTime(element.stopTime)}} </p> </mat-cell>
      </ng-container>

      <ng-container matColumnDef="itemCond">
        <mat-cell *matCellDef="let element" [attr.colspan]="displayedColumns.length">
          {{parseCondition(element.itemCond)}} : {{element.comments}}
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef> Actions </mat-header-cell>
        <mat-cell *matCellDef="let element">
          &nbsp; <a [routerLink]="['../edit/', this.dataSrc, element._id]">Edit</a>
          &nbsp; <a (click)="deleteElement(this.dataSrc , element._id || '')">Delete</a>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;" class="element-row"></mat-row>
      <div *ngIf="this.dataSrc == 'rcrd'">
        <mat-row *matRowDef="let row; columns: ['itemCond']"></mat-row>
      </div>
    </mat-table>

    <mat-paginator class="mat-elevation-z8" [pageSize]="10" [pageSizeOptions]="[5, 10, 50, 100]" [showFirstLastButtons]="true"></mat-paginator>
    <button class="admin-add" [routerLink]="['../new/', this.dataSrc]"> Add New </button>
    <button class="admin-add" (click)="sendMail()" *ngIf="this.dataSrc == 'rsrv'"> SEND RETURN REMINDERS </button>

  </div>
  `,
})
export class ManagerHomeComponent implements OnInit, OnDestroy {
  private emailSub: Subscription = new Subscription();
  private elemSub : Subscription = new Subscription();
  private accts$: Observable<Account[]> = new Observable();
  private items$: Observable<Item[]> = new Observable();
  private locks$: Observable<Locker[]> = new Observable();
  private rcrds$: Observable<Record[]> = new Observable();
  private rsrvs$: Observable<Reservation[]> = new Observable();

  public custName: string | undefined = "";
  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  public displayedColumns : string[] = [];
  public dataSrc: string = "";
  public expandedElement: Record | null = {};

  constructor(
    private databaseService: DatabaseService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngOnInit(): void {
    this.custName = this.getUserNameFromInfo();
    this.changeTableDataSrc('acct');
  }
  ngOnDestroy(): void {
    this.emailSub.unsubscribe();
    this.elemSub.unsubscribe();
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private getUserNameFromInfo(): string {
    let cacheInfo = localStorage.getItem("userInfo")?.toString();
    if (cacheInfo) {
      let cacheStr = cacheInfo.split(" ");
      let userName = cacheStr[1] + " " + cacheStr[2];
      return userName;
    } else return '';
  }

  /* 
  *  Parse time to display
  *  from number YYYYMMDDHHMM to string DD MM YY, HH:MM
  */
  parseTime(time: Number | undefined): String {
    let timeStr = time?.toString();
    let dateRgx = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;

    if (timeStr) {
      let dateSet: Date = new Date(timeStr.replace(dateRgx, '$1-$2-$3T$4:$5:00'));
      return dateSet.toLocaleString('en-NA', {year: '2-digit', month: 'short' , day:'2-digit', hour: '2-digit', minute:'2-digit', hour12:false});
    } else return "Bad Date";
  }

  // parse condition to show equivalent
  parseCondition(condition: number): String {
    let condStr = condition?.toString();

    if (condStr) {
      switch ( condStr ) {
        case "1": return "Completely Broken";
        case "2": return "Mostly Broken";
        case "3": return "Moderately Broken";
        case "4": return "Somewhat Broken";
        case "5": return "Slightly Broken";
        case "6": return "Slightly Fine";
        case "7": return "Somewhat Fine";
        case "8": return "Moderately Fine";
        case "9": return "Mostly Fine";
        case "10": return "Completely Fine";
        default: throw new Error("Unknown Condition");
      }
    } else return "Missing Condition";
  }

  deleteElement(element: string , id: string) : void {
    switch (element) {
      case 'acct': this.databaseService.deleteAccount(id).subscribe({ next: () => this.accts$ = this.databaseService.getAccounts() });
        break;
      case 'item': this.databaseService.deleteItem(id).subscribe({ next: () => this.items$ = this.databaseService.getItems() });
        break;
      case 'lock': this.databaseService.deleteLocker(id).subscribe({ next: () => this.locks$ = this.databaseService.getLockers() });
        break;
      case 'rcrd': this.databaseService.deleteRecord(id).subscribe({ next: () => this.rcrds$ = this.databaseService.getRecords() });
        break;
      case 'rsrv': this.databaseService.deleteReservation(id).subscribe({ next: () => this.rsrvs$ = this.databaseService.getReservations() });
        break;
      default: throw Error('invalid collection');
    }
  }

  changeTableDataSrc(collection : string): void {
    switch ( collection ) {
      case 'acct':
        this.elemSub = this.databaseService.getAccounts().subscribe( (data) => { this.dataSource.data = data; });
        this.displayedColumns = ['lastName', 'userName', 'userRFID', 'userType', 'actions'];
        this.dataSrc = 'acct';
        break;
      case 'item':
        this.elemSub = this.databaseService.getItems().subscribe( (data) => { this.dataSource.data = data; });
        this.displayedColumns = ['itemFree', 'itemIcon', 'itemName', 'itemLock', 'itemDesc', 'actions'];
        this.dataSrc = 'item';
        break;
      case 'lock':
        this.elemSub = this.databaseService.getLockers().subscribe( (data) => { this.dataSource.data = data; });
        this.displayedColumns = ['lockName', 'lockOpen', 'lockShut', 'actions'];
        this.dataSrc = 'lock';
        break;
      case 'rcrd':
        this.elemSub = this.databaseService.getRecords().subscribe( (data) => { this.dataSource.data = data; });
        this.displayedColumns = ['itemName', 'itemLock', 'userName', 'strtTime', 'stopTime', 'pickedUp', 'actions'];
        this.dataSrc = 'rcrd';
        break;
      case 'rsrv':
        this.elemSub = this.databaseService.getReservations().subscribe( (data) => { this.dataSource.data = data; });
        this.displayedColumns = ['pickedUp', 'itemName', 'itemLock', 'userName', 'strtTime', 'stopTime', 'actions'];
        this.dataSrc = 'rsrv';
        break;
      default: throw Error('invalid collection');
    }
    this.changeDetectorRef.detectChanges();
  }

  sendMail() {
    let req: any = { 
      userName: 'ase127@msstate.edu',
      message: 'Your reservation for Skil Circular Saw will expire on 11/21/2022, 1:40:00 PM . Click here to extend: http://10.13.86.178:4200/'
    };
    this.emailSub = this.databaseService.sendMail(req).subscribe();
    window.location.reload();
  }
}