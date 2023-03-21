import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

import { ComponentCanDeactivate } from 'src/app/_services/prevent-leave.guard';
import { DatabaseService } from 'src/app/_services/database.service';
import { Item, Record, Reservation } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-survey',
  template: `
  <h1> WARNING: Complete Survey Before Continuing </h1>
  <form class="survey-form" [formGroup]="recordForm" (ngSubmit)="record()">
    <p> Condition of {{itemName}}: Reserved on {{parseTime(rsrvStrt)}} </p>
    <div class="survey-radio">
      <label> Completely Broken <br> <input type="radio" formControlName="itemCond" [value]="1"> <span class="survey-mark"></span> </label>
      <label> Mostly Broken     <br> <input type="radio" formControlName="itemCond" [value]="2"> <span class="survey-mark"></span> </label>
      <label> Moderately Broken <br> <input type="radio" formControlName="itemCond" [value]="3"> <span class="survey-mark"></span> </label>
      <label> Somewhat Broken   <br> <input type="radio" formControlName="itemCond" [value]="4"> <span class="survey-mark"></span> </label>
      <label> Slightly Broken   <br> <input type="radio" formControlName="itemCond" [value]="5"> <span class="survey-mark"></span> </label>
      <label> Slightly Fine     <br> <input type="radio" formControlName="itemCond" [value]="6"> <span class="survey-mark"></span> </label>
      <label> Somewhat Fine     <br> <input type="radio" formControlName="itemCond" [value]="7"> <span class="survey-mark"></span> </label>
      <label> Moderately Fine   <br> <input type="radio" formControlName="itemCond" [value]="8"> <span class="survey-mark"></span> </label>
      <label> Mostly Fine       <br> <input type="radio" formControlName="itemCond" [value]="9"> <span class="survey-mark"></span> </label>
      <label> Completely Fine   <br> <input type="radio" formControlName="itemCond" [value]="10"><span class="survey-mark"></span> </label>
    </div>

    <p> Additional Comments </p>
    <textarea class="survey-textarea" formControlName="comments" placeholder="comments"></textarea>
    <br> <button class="bubble-button" type="submit" [disabled]="recordForm.invalid"> Record </button>
  </form>
  `
})
export class SurveyComponent implements OnInit, ComponentCanDeactivate{
  private reservation$: Observable<Reservation> = new Observable();
  private item$: Observable<Item> = new Observable();
  private rsrvID: string = '';

  public recordForm: FormGroup = new FormGroup({});
  public itemName: string = '';
  public rsrvStrt: Number = 0;
  public surveyed: boolean = false;
  
  constructor(    
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private databaseService: DatabaseService
  ) { }
  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (!id) alert('No id provided');
    else {
      this.rsrvID = id?.toString();

      this.reservation$ = this.databaseService.getReservation(this.rsrvID!);
      this.reservation$.subscribe({
        next: (data) => { 
          this.rsrvStrt = data.strtTime!;
          this.item$ = this.databaseService.getItem(data.itemID!);
          this.item$.subscribe({
            next: (data) => { this.itemName = data.itemName!; },
            error: () => { this.itemName = "Missing Name"; }
          });
        }, error: (err) => { console.log(err); },
      });
    }

    this.recordForm = this.formBuilder.group({
      itemCond: ['', Validators.required],
      comments: ['']
    });
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean { return this.surveyed; }

  record() {
    if (this.rsrvID != null) {
      this.reservation$.subscribe({
        next: (rsrv) => {
          let dateTime = new Date();
          let record: Record = {
            itemID: rsrv.itemID,
            userID: rsrv.userID,
            expect: rsrv.pickedUp == true ? rsrv.strtTime : rsrv.stopTime,
            actual: dateTime.toLocaleString('en-NA', {year: '2-digit' , month: 'short' , day:'2-digit', hour: '2-digit', minute:'2-digit', hour12:false}),
            pickedUp: !rsrv.pickedUp,
            itemCond: this.recordForm.get('itemCond')?.value,
            comments: this.recordForm.get('comments')?.value
          }

          if (record.pickedUp == true) { 
            this.databaseService.deleteReservation(rsrv._id!).subscribe({
              next: (res) => { console.log(res); },
              error: (err) => { console.log(err); }
            });
          }
          else this.sendMail(rsrv);
          
          this.surveyed = true;
          this.databaseService.createRecord(record).subscribe({
            next: () => { this.router.navigate(['/customer/profile']); },
            error: (error) => { console.error(error); }
          });
        }, error: (err) => { console.log(err); }
      });
    }
  }

  sendMail(reserve: Reservation) {
    let req: any = { 
      userID: reserve.userID!.toString(),
      itemID: reserve.itemID!.toString(),
      stopTime: this.parseTime(reserve.stopTime!)
    };

    this.databaseService.sendMail(req).subscribe({
      next: (res) => { console.log(res); },
      error: (err) => { console.log(err); }
    });
  }

  /* 
  *  Parse time to display
  *  from number YYYYMMDDHHMM to string DD MM YY, HH:MM XM
  */
  parseTime(time: Number): String {
    let timeStr = time?.toString();
    let dateRgx = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;

    if (timeStr) {
      let dateSet: Date = new Date(timeStr.replace(dateRgx, '$1-$2-$3T$4:$5:00'));
      return dateSet.toLocaleString('en-NA', {year: '2-digit', month: 'short' , day:'2-digit', hour: '2-digit', minute:'2-digit', hour12:true});
    } else return "Bad Date";
  }
}