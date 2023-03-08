import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Item } from 'src/app/_interfaces/item';
import { DatabaseService } from 'src/app/_services/database.service';

@Component({
  selector: 'app-item-list',
  template: `
  <h1> Welcome to Smart Locker </h1>
  <h1> Tools: </h1>
  <div class="item-list">
    <div *ngFor="let item of items$ | async">
      <a class="list-item" [routerLink]="['/customer/items', item._id]">
        <img class="list-img" [src]="item.itemIcon" [title]="item.itemName">
        <br>  {{item.itemName}}
      </a>
    </div>
  </div>
  `
})
export class ItemListComponent implements OnInit {
  items$: Observable<Item[]> = new Observable();
  custName: string | undefined = "";

  constructor(private databaseService: DatabaseService) { }
  
  ngOnInit(): void {
    this.items$ = this.databaseService.getItems();
  }
}
