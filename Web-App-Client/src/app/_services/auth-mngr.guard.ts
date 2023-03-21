import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthMngrGuard implements CanActivate {
  constructor( private router: Router ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
      if (this.isManager()) return true;
      
      // return to login if not authenticated
      this.router.navigate(['/login']);
      return false;
  }

  public isManager(): boolean {
    let status = false;
    if (localStorage.getItem('userType') == "manager") status = true;
    else status = false;
    return status;
  }
}
