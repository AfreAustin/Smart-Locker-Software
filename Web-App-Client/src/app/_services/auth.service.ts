import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  logout() :void {
    localStorage.removeItem('userID');
    localStorage.removeItem('userType');
  }
}
