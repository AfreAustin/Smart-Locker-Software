import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from './_services/auth.service';
import { DatabaseService } from './_services/database.service';
import { Account } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-login',
  template: `
  <div class="login"> 
    <img class="login-img" src="assets/icons/logo.svg">

    <form class="login-form" [formGroup]="loginForm" (ngSubmit)="login()">
      <p class="error-msg"> {{message}} </p>

      <input class="login-input" type="email" formControlName="userName" placeholder="Email">
      <input class="login-input" type="password" formControlName="password" placeholder="Password">
      
      <button class="bubble-button" type="submit" [disabled]="loginForm.invalid"> Log In </button>
      <br>
      <button class="bubble-button" (click)="RFIDlogin()"> Scan RFID </button>
    </form>
  </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup = new FormGroup({});
  public message: string = '';

  accounts$: Observable<Account[]> = new Observable();
  loginSub: Subscription = new Subscription();
  RFIDSub: Subscription = new Subscription();
  rfidAcc: Account[] = [];
  gotRFID: string = "";

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService,
    private authService: AuthService
  ) { }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.authService.logout();
  }
  ngOnDestroy(): void {
    this.loginSub.unsubscribe();
    this.RFIDSub.unsubscribe();
  }

  get userName() { return this.loginForm.get('userName')!; }
  get password() { return this.loginForm.get('password')!; }

  /* 
  *  Get credentials from form, then send to server for authentication
  *  On success, set session with userName and userType
  *  Then send to homepage
  */
  login() : void {
    let body: any = {
      userName: this.userName.value,
      password: this.password.value,
    };

    this.databaseService.login(body).subscribe({
      next: (res) => {
        let response = res.split(" ");
        localStorage.setItem('userType', response[0]);
        localStorage.setItem('userID', response[1]);
        
        this.router.navigate(['/customer/items']);
      }, error: (err) => { this.message = err.error }
    });
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
    this.loginSub = this.accounts$.subscribe( accounts => this.rfidAcc = accounts );
    this.RFIDSub = this.databaseService.getRFID().subscribe((res) => {
      this.gotRFID = res;
      
      for (let user of this.rfidAcc) { 
        console.log('DB:' + typeof user.userRFID + ' Scan: ' + typeof this.gotRFID.toString());
        if (this.gotRFID.toString() == user.userRFID ) {
          if (user.userType == "manager") localStorage.setItem('isManager', "true");
          localStorage.setItem('userName', this.userName.value );
          
          this.router.navigate(['/customer/items']);
        } else this.message = 'Bad Read, try again';
      }
    });
  }
}