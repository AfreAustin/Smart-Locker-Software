import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { Account } from './_interfaces/account';
import { AuthService } from './_services/auth.service';
import { DatabaseService } from './_services/database.service';

@Component({
  selector: 'app-login',
  template: `
  <div class="login"> 
    <form [formGroup]="loginForm" (ngSubmit)="login()">
      <img src="assets/logo.png" style="height:50vh;">
      <p style="color: red;"> {{message}} </p>

      <input class="input-text" type="email" formControlName="userName" placeholder="Username">
      <br>
      <input class="input-text" type="password" formControlName="password" placeholder="Password">
      <br>
      <button class="bubble-button" type="submit" [disabled]="loginForm.invalid"> Log In </button>
    </form>
    
    <button class="bubble-button" (click)="RFIDlogin()"> Scan RFID </button>
  </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  private accounts$: Observable<Account[]> = new Observable();
  private subs: Subscription = new Subscription();
  private Rsubs: Subscription = new Subscription();
  private getRFID$: Observable<string> = new Observable();
  rfidAcc: Account[] = [];
  gotRFID: string = "";
  loginForm: FormGroup = new FormGroup({});
  message: string = '';

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService, 
    private router: Router,
    private formBuilder: FormBuilder
  ) { }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.authService.logout();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.Rsubs.unsubscribe();
  }

  /* 
  *  Get login, then subscribe to accounts collection to compare username and password
  *  On success, set cache and send to homepage
  */
  login() {
    const inUser = this.loginForm.get('userName')?.value;
    const inPass = this.loginForm.get('password')?.value;

    this.accounts$ = this.databaseService.getAccounts();
    this.subs = this.accounts$.subscribe( accounts => {
      for (let user of accounts) {
        if (inUser == user.userName && inPass == user.password ) {
          if (user.userType == "manager") localStorage.setItem('isManager', "true");
          localStorage.setItem('userInfo', user.userName + ' ' + user.foreName + ' ' + user.lastName + ' ' + user.userRFID + ' ' + user._id);
          
          this.router.navigate(['/customer/items']);
        } else this.message = "Invalid Login, try again";
    }});
  }

  /* 
  *  Get RFID login, then subscribe to accounts collection to compare username and password
  *  On success, set cache and send to homepage
  */
  RFIDlogin() {
  console.log("Shows");
    let body: any = { 
      lockerID: '1',
      command: 'RFID'
    };
    
    this.accounts$ = this.databaseService.getAccounts();
    this.subs = this.accounts$.subscribe( accounts => this.rfidAcc = accounts );
    this.Rsubs = this.databaseService.getRFID().subscribe((item) => {
      this.gotRFID =  item;
      
      for (let user of this.rfidAcc) { 
        console.log('DB:' + typeof user.userRFID + ' Scan: ' + typeof this.gotRFID.toString());
        if (this.gotRFID.toString() == user.userRFID ) {
          if (user.userType == "manager") localStorage.setItem('isManager', "true");
          localStorage.setItem('userInfo', user.userName + ' ' + user.foreName + ' ' + user.lastName + ' ' + user.userRFID + ' ' + user._id);
          
          this.router.navigate(['/customer/items']);
        } else this.message = 'Bad Read';
      }
    });
  }
}