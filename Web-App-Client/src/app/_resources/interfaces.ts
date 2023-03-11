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
    itemReqs?: string;
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
    rsrvtion?: string;
    itemName?: string;
    itemLock?: string;
    userName?: string;
    strtTime?: Number;
    stopTime?: Number;
    pickedUp?: Boolean;
    itemCond?: Number;
    comments?: string;
    _id?: string;
}

export interface Reservation {
    itemName?: string;
    itemLock?: string;
    userName?: string;
    strtTime?: Number;
    stopTime?: Number;
    pickedUp?: Boolean;
    _id?: string;
}