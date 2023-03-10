import { Component } from '@angular/core';

@Component({
  selector: 'app-web-layout',
  template: `
  <mat-sidenav-container class="sidenav">
    <mat-sidenav mode="side" opened class="sidenav-header">
      <img class="sidenav-item" src="assets/logo.png">
      <a class="sidenav-item" routerLink="/customer/profile">
        <i class="material-icons"> account_circle </i> <br>
        Profile
      </a>
      <a class="sidenav-item" routerLink="/customer/items"> 
        <i class="material-icons"> assignment </i> <br>
        Items
      </a>
      <a class="sidenav-item"> 
        <i class="material-icons"> keyboard </i> <br>
        Keyboard
      </a>
      <a class="sidenav-item" routerLink="/manage/home" *ngIf="userType == 'true'"> 
        <i class="material-icons"> perm_device_info </i> <br>
        Admin
      </a>
      <a class="sidenav-item" *ngIf="userType == 'false'"></a>
      <a class="sidenav-item" routerLink="/login"> 
        <i class="material-icons"> logout </i> <br>
        Log Out
      </a>
    </mat-sidenav>
    
    <mat-sidenav-content class="sidenav-content"> 
      <router-outlet></router-outlet> 
    </mat-sidenav-content>
  </mat-sidenav-container>
  `
})
export class WebLayoutComponent {
  userType: string | undefined = localStorage.getItem('isManager')?.toString();
}