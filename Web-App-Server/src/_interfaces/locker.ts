import * as mongodb from "mongodb";

export interface Locker {
  lockName: string;
  lastOpen: string;
  lastShut: string;
  _id?: mongodb.ObjectId;
}