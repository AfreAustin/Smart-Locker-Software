import * as mongodb from "mongodb";

export interface Account {
   userName: string;
   password: string;
   userType: 'manager' | 'customer';
   userRFID: string;
   foreName: string;
   lastName: string;
   _id?: mongodb.ObjectId;
}

export interface Item {
    itemName: string;
    itemDesc: string;
    itemIcon: string;
    itemLock: string;
    itemReqs: string;
    itemFree: boolean;
    _id?: mongodb.ObjectId;
}

export interface Locker {
lockName: string;
lastOpen: string;
lastShut: string;
_id?: mongodb.ObjectId;
}

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

export interface Reservation {
    itemName: string;
    itemLock: string;
    userName: string;
    strtTime: Number;
    stopTime: Number;
    pickedUp: Boolean;
    _id?: mongodb.ObjectId;
}