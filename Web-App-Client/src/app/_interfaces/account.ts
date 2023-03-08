export interface Account {
    userName?: string;
    password?: string;
    userType?: 'manager' | 'customer';
    userRFID?: string;
    foreName?: string;
    lastName?: string;
    _id?: string;
}