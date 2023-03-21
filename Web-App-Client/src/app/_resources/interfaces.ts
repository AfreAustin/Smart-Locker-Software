export interface Account {
    userName?: string;
    password?: string;
    userType?: 'manager' | 'customer';
    userRFID?: string;
    foreName?: string;
    lastName?: string;
    _id?: string;
}

export interface Item {
    itemName?: string;
    itemDesc?: string;
    itemIcon?: string;
    itemLock?: string;
    itemFree?: boolean;
    _id?: string;
}

export interface Locker {
    lockName?: string;
    lastOpen?: string;
    lastShut?: string;
    _id?: string;
}

export interface Record {
    itemID?: string;
    userID?: string;
    expect?: Number;
    actual?: String;
    pickedUp?: Boolean;
    itemCond?: Number;
    comments?: string;
    _id?: string;
}

export interface Reservation {
    itemID?: string;
    userID?: string;
    strtTime?: Number;
    stopTime?: Number;
    pickedUp?: Boolean;
    _id?: string;
}