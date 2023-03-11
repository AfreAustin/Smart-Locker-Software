import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { DatabaseService } from 'src/app/_services/database.service';
import { Item } from 'src/app/_resources/interfaces';

@Component({
  selector: 'app-item-list',
  template: `
  <h1> Welcome to Smart Locker </h1>
 
  <div class="item-list">
    <div *ngFor="let item of items$ | async">
      <a class="list-item" [routerLink]="['/customer/items', item._id]">
        <img [src]="item.itemIcon" [title]="item.itemName">
        <br> {{item.itemName}}
      </a>
    </div>
  </div>
  `
})
export class ItemListComponent implements OnInit {
  items$: Observable<Item[]> = new Observable();

  constructor(private databaseService: DatabaseService) { }
  
  ngOnInit(): void { this.items$ = this.databaseService.getItems(); }
}