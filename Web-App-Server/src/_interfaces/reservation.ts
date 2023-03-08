import * as mongodb from "mongodb";

export interface Reservation {
  itemName: string;
  itemLock: string;
  userName: string;
  strtTime: Number;
  stopTime: Number;
  pickedUp: Boolean;
  _id?: mongodb.ObjectId;
}