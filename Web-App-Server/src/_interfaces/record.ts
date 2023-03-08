import * as mongodb from "mongodb";

export interface Record {
  rsrvtion: string;
  itemName: string;
  itemLock: string;
  userName: string;
  strtTime: Number;
  stopTime: Number;
  pickedUp: Boolean;
  itemCond: Number;
  comments: String;
  _id?: mongodb.ObjectId;
}