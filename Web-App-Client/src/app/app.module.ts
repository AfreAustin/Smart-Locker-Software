import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AppComponent } from './app.component';
import { WebLayoutComponent } from './_resources/layout-web.component';
import { AuthMngrGuard } from './_services/auth-mngr.guard';
import { PreventLeaveGuard } from './_services/prevent-leave.guard';

import { LoginComponent } from './login.component';
import { ItemListComponent } from './_view-cust/item-list.component';
import { ItemDetailsComponent } from './_view-cust/item-details.component';
import { ProfileComponent } from './_view-cust/profile.component';
import { SurveyComponent } from './_view-cust/survey.component';
import { ManagerHomeComponent } from './_view-mngr/manager-home.component';
import { AddElementComponent } from './_view-mngr/add-element.component';
import { EditElementComponent } from './_view-mngr/edit-element.component';

import { AccountFormComponent } from './_forms/account-form.component';
import { ItemFormComponent } from './_forms/item-form.component';
import { LockerFormComponent } from './_forms/locker-form.component';
import { ReservationFormComponent } from './_forms/reservation-form.component';
import { RecordFormComponent } from './_forms/record-form.component';

@NgModule({
  declarations: [
    AppComponent,
    WebLayoutComponent,

    LoginComponent,
    ItemListComponent,
    ItemDetailsComponent,
    ProfileComponent,
    SurveyComponent,
    ManagerHomeComponent,
    AddElementComponent,
    EditElementComponent,

    AccountFormComponent,
    ItemFormComponent,
    LockerFormComponent,
    ReservationFormComponent,
    RecordFormComponent,    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    MatSidenavModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  providers: [
    AuthMngrGuard,
    PreventLeaveGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }