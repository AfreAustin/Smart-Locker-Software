import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }

  logout() :void {
    localStorage.setItem('isManager','false');
    localStorage.removeItem('userInfo');
  }
}