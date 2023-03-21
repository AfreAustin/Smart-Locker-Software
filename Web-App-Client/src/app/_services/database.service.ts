import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { Account, Item, Locker, Reservation, Record } from 'src/app/_resources/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private url = 'http://localhost:5200';  // for local dev
  // private url = 'http://10.13.86.178:5200'; // for on-site dev
  private accounts$: Subject<Account[]> = new Subject();
  private items$: Subject<Item[]> = new Subject();
  private lockers$: Subject<Locker[]> = new Subject();
  private reservations$: Subject<Reservation[]> = new Subject();
  private records$: Subject<Record[]> = new Subject();
  
  constructor(private httpClient: HttpClient) { }

  login(body: any) { return this.httpClient.post(`${this.url}/login`, body, { responseType: `text` }); }
  getRFID(): Observable<string> { return this.httpClient.get<string>(`${this.url}/getRFID`); }

  reserve(itemID: string, body: any) { return this.httpClient.post(`${this.url}/reserve/${itemID}`, body, {responseType: 'text'}); }
  checkOut(id:string, reservation: Reservation): Observable<string> { return this.httpClient.put(`${this.url}/checkout/${id}`, reservation, { responseType: 'text' }); }
  categorize(userID: string): Observable<Reservation[]> { return this.httpClient.get<Reservation[]>(`${this.url}/categorize/${userID}`); }

  // CHECK IF STILL WORKS AFTER UPDATE
  unlockLocker(itemID: string) { return this.httpClient.get(`${this.url}/unlock/${itemID}`, { responseType: 'text'}); }
  sendMail(body: string) { return this.httpClient.post(`${this.url}/email`, body, { responseType: 'text' }) }

  getProperty(elem:string, id: string, prop: string): Observable<string> { return this.httpClient.get<string>(`${this.url}/fetch/${elem}/${id}/${prop}`); }

  // ----- Accounts -----
  getAccounts(): Subject<Account[]> {
    this.httpClient.get<Account[]>(`${this.url}/fetch/acct`).subscribe(accounts => { this.accounts$.next(accounts); });
    return this.accounts$;
  }
  getAccount(id: string): Observable<Account> { return this.httpClient.get<Account>(`${this.url}/fetch/acct/${id}`); }
  createAccount(account: Account): Observable<string> { return this.httpClient.post(`${this.url}/new/acct`, account, { responseType: 'text' }); }
  updateAccount(id: string, account: Account): Observable<string> { return this.httpClient.put(`${this.url}/edit/acct/${id}`, account, { responseType: 'text' }); }
  deleteAccount(id: string): Observable<string> { return this.httpClient.delete(`${this.url}/delete/acct/${id}`, { responseType: 'text' }); }

  // ----- Items -----
  getItems(): Subject<Item[]> {
    this.httpClient.get<Item[]>(`${this.url}/fetch/item`).subscribe(items => { this.items$.next(items); });
    return this.items$;
  }
  getItem(id: string): Observable<Item> { return this.httpClient.get<Item>(`${this.url}/fetch/item/${id}`); }
  createItem(item: Item): Observable<string> { return this.httpClient.post(`${this.url}/new/item`, item, { responseType: 'text' }); }
  updateItem(id: string, item: Item): Observable<string> { return this.httpClient.put(`${this.url}/edit/item/${id}`, item, { responseType: 'text' }); }
  deleteItem(id: string): Observable<string> { return this.httpClient.delete(`${this.url}/delete/item/${id}`, { responseType: 'text' }); }

  // ----- Lockers -----
  getLockers(): Subject<Locker[]> {
    this.httpClient.get<Locker[]>(`${this.url}/fetch/lock`).subscribe(lockers => { this.lockers$.next(lockers); });
    return this.lockers$;
  }
  getLocker(id: string): Observable<Locker> { return this.httpClient.get<Locker>(`${this.url}/fetch/lock/${id}`); }
  createLocker(locker: Locker): Observable<string> { return this.httpClient.post(`${this.url}/new/lock`, locker, { responseType: 'text' }); }
  updateLocker(id: string, locker: Locker): Observable<string> { return this.httpClient.put(`${this.url}/edit/lock/${id}`, locker, { responseType: 'text' }); }
  deleteLocker(id: string): Observable<string> { return this.httpClient.delete(`${this.url}/delete/lock/${id}`, { responseType: 'text' }); }

  // ----- Records -----
  getRecords(): Subject<Record[]> {
    this.httpClient.get<Record[]>(`${this.url}/fetch/rcrd`).subscribe(records => { this.records$.next(records); });
    return this.records$;
  }
  getRecord(id: string): Observable<Record> { return this.httpClient.get<Record>(`${this.url}/fetch/rcrd/${id}`); }
  createRecord(record: Record): Observable<string> { return this.httpClient.post(`${this.url}/new/rcrd`, record, { responseType: 'text' }); }
  updateRecord(id: string, record: Record): Observable<string> { return this.httpClient.put(`${this.url}/edit/rcrd/${id}`, record, { responseType: 'text' }); }
  deleteRecord(id: string): Observable<string> { return this.httpClient.delete(`${this.url}/delete/rcrd/${id}`, { responseType: 'text' }); }

  // ----- Reservations -----
  getReservations(): Subject<Reservation[]> {
    this.httpClient.get<Reservation[]>(`${this.url}/fetch/rsrv`).subscribe(reservations => { this.reservations$.next(reservations); });
    return this.reservations$;
  }
  getReservation(id: string): Observable<Reservation> { return this.httpClient.get<Reservation>(`${this.url}/fetch/rsrv/${id}`); }
  createReservation(reservation: Reservation): Observable<string> { return this.httpClient.post(`${this.url}/new/rsrv`, reservation, { responseType: 'text' }); }
  updateReservation(id: string, reservation: Reservation): Observable<string> { return this.httpClient.put(`${this.url}/edit/rsrv/${id}`, reservation, { responseType: 'text' }); }
  deleteReservation(id: string): Observable<string> { return this.httpClient.delete(`${this.url}/delete/rsrv/${id}`, { responseType: 'text' }); }
}