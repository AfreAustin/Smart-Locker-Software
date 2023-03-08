import * as mongodb from "mongodb";

export interface Item {
  itemName: string;
  itemDesc: string;
  itemIcon: string;
  itemLock: string;
  itemReqs: string;
  itemFree: boolean;
  _id?: mongodb.ObjectId;
}