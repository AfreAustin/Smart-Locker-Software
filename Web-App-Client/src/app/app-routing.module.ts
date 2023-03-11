import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},    // empty route
  { path: 'login', component: LoginComponent},

  { path: 'customer', component: WebLayoutComponent,
    children: [
      { path: 'items', component: ItemListComponent},
      { path: 'items/:id', component: ItemDetailsComponent},
      { path: 'profile', component: ProfileComponent},
      { path: 'survey/:id', component: SurveyComponent, canDeactivate: [PreventLeaveGuard]},
    ]
  },

  { path: 'manage', component: WebLayoutComponent,
    children: [
      { path: 'home', component: ManagerHomeComponent},
      { path: 'new/:element', component: AddElementComponent},
      { path: 'edit/:element/:id', component: EditElementComponent},
    ], canActivate: [AuthMngrGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }