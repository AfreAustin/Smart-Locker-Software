import * as express from "express";
import * as mongodb from "mongodb";

const nodemailer = require("nodemailer");
const request = require('request');

import { collections } from "./database";
import { Account, Item, Locker, Reservation, Record } from "./interfaces";
export const databaseRouter = express.Router();
databaseRouter.use(express.json());

class Queue {
    elements: any = null;
    head: any = null;
    tail: any = null;
    
    constructor() {
      this.elements = {};
      this.head = 0;
      this.tail = 0;
    }
    enqueue(element: string) {
      this.elements[this.tail] = element;
      this.tail++;
    }
    dequeue() {
      const item = this.elements[this.head];
      delete this.elements[this.head];
      this.head++;
      return item;
    }
    peek() { return this.elements[this.head]; }
    isEmpty() { return this.length === 0; }
    get length() { return this.tail - this.head; }
} let CommandQueue = new Queue();

/*
*  logs user in if correct credentials are received
*  queries database for username; on success, compares password
*/
databaseRouter.post("/login", async(req, res) => {
    try {
        const [ reqUser, reqPass ] = [ req.body.userName, req.body.password ];
        const account = await collections.accounts.findOne({ userName: reqUser });

        if (account) {
            if (account.password == reqPass) res.status(200).send(account.userType + " " + account._id);    // if (account.password == reqPass || account.userRFID == reqUser)
            else res.status(400).send(`Wrong username or password`);
        } else res.status(404).send(`Account not registered, See Manager`);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// gets RFID from scanner
databaseRouter.get("/getRFID", async (req, res) => {
    try {
        // This returns just the RFID number (or NO:ACK: on fail)
        request.post("http://127.0.0.1:5201/getRFID", (error: any, response: any, body: any) => {
            if (error) return console.log(error); 
            
            console.log(body);
            if (body == "NO:ACK:") res.status(200).send(body);
            else if (body.length > 13) res.status(200).send(body.split(":")[2].substring(4));
            else res.status(200).send(body);
        }).body = ":1:RFID:";
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// reserves an item for a user
databaseRouter.post("/reserve/:id", async(req, res) => {
    try {
        const itemID = req.params.id ;
        const [ userID, strt, stop ] = [ req.body.reqUser, req.body.reqStrt, req.body.reqStop ];
        
        const item = await collections.items.findOne({ _id: new mongodb.ObjectId(itemID) });
        const user = await collections.accounts.findOne({ _id: new mongodb.ObjectId(userID) });
        const reservations = await collections.reservations.find({}).toArray();

        if (strt >= stop) res.status(400).send(`Start Time cannot be before Stop Time`);
        else {
            if (!item || !user || !reservations) res.status(404).send(`Failed to find an element, try again`); 
            else {
                let available: Boolean = false;
                available = checkAvailability(item, reservations, strt, stop);

                if (available == false) res.status(400).send(`Item unavailable at that time`); 
                else {
                    let reservation: Reservation = {
                        "itemID": itemID,
                        "userID": userID,
                        "strtTime": strt,
                        "stopTime": stop,
                        "pickedUp": false
                    };

                    const result = await collections.reservations.insertOne(reservation);

                    if (result.acknowledged) res.status(201).send(`Created new reservation: id ${result.insertedId}`);
                    else res.status(400).send("Failed to create reservation");
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

function checkAvailability(item: Item, reservations: Reservation[], strt: Number, stop: Number): Boolean {
    if (reservations.length == 0) return true;
    else {
        for (let reserve of reservations) {
            if ((reserve.itemID === item._id.toString() && strt >= reserve.strtTime && strt < reserve.stopTime) ||
                (reserve.itemID === item._id.toString() && stop > reserve.strtTime && stop <= reserve.stopTime)
            ) return false;
        } return true;
    } 
}

databaseRouter.put("/checkout/:id", async (req,res) => {
    try {
        const id = req?.params?.id;
        const reservation: Reservation = req.body;
        const item: Item = await collections.items.findOne({ itemName: reservation.itemID });

        let dateTime = new Date();
        let dateSet : string = dateTime.toLocaleString('en-NA', {timeZone: 'CST', hour12: false});
        let dateNum : Number = parseInt(dateSet.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3$2$1$4$5'));
        console.log(dateSet);
        console.log(dateNum);
        console.log(reservation.strtTime);

        if (item && id) {
            if ((reservation.pickedUp == true) || (reservation.pickedUp == false && item.itemFree == true && reservation.strtTime && reservation.strtTime <= dateNum)) {
                const checkout = await collections.reservations.updateOne({ _id: new mongodb.ObjectId(id) }, { $set: {
                    itemID: item._id.toString(),
                    userID: reservation.userID,
                    strtTime: reservation.strtTime,
                    stopTime: reservation.stopTime,
                    pickedUp: (reservation.pickedUp == false ? true : false)
                }});
                const gotItem = await collections.items.updateOne({ _id: new mongodb.ObjectId(item._id) }, { $set: {
                    itemName: item.itemName,
                    itemDesc: item.itemDesc,
                    itemIcon: item.itemIcon,
                    itemLock: item.itemLock,
                    itemFree: (reservation.pickedUp == false ? false : true)
                } });

                if (checkout && checkout.matchedCount) {
                    if (gotItem && gotItem.matchedCount) res.status(200).send(`Updated reservation and item: id ${id} --> ${reservation.itemID}.`);
                    else if (!gotItem.matchedCount) res.status(404).send(`Failed to find item: id ${reservation.itemID}`);
                    else res.status(304).send(`Failed to update item: id ${reservation.itemID}`); 
                } 
                else if (!checkout.matchedCount) res.status(404).send(`Failed to find reservation: id ${id}`);
                else res.status(304).send(`Failed to update reservation: id ${id}`); 
                
            } else res.status(400).send(`Item cannot be picked up`);
        } else res.status(404).send(`Failed to find item`);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
});

// get a user's reservations
databaseRouter.get("/categorize/:userID", async(req, res) => {
    try {
        const user = req?.params?.userID;

        if (!user) res.status(404).send(`User not found`);
        else {
            const reservations = await collections.reservations.find({ userID: user }).toArray();

            for (let reserve of reservations) {
                let item: Item = await collections.items.findOne({ _id: new mongodb.ObjectId(reserve.itemID) });
                if (item) reserve.itemID = item.itemName;
            }
            
            res.status(200).send(reservations);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// unlocks a locker -- CHECK IF STILL WORKS
databaseRouter.get("/unlock/:id", async (req, res) => {
    try {
        try {
            const itemID = req?.params?.id;
            const item = await collections.items.findOne({ _id: new mongodb.ObjectId(itemID) });

            if (item) {
                request.post("http://127.0.0.1:5201/unlock").body = ":" + item.itemLock + ":UL:";
                res.status(200).send(`Locker unlocked`);
            } else res.status(404).send(`Item not found`);
        } catch (error) { res.status(500).send(error.message); }
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
});

// sends email notifications -- change reqObj to include mailOptions
databaseRouter.post("/email", async (req, res) => {
    try {
        const user = await collections.accounts.findOne({ _id: new mongodb.ObjectId(req.body.userID) });
        const item = await collections.items.findOne({ _id: new mongodb.ObjectId(req.body.itemID) });

        if (user && item) {
            var transport = nodemailer.createTransport({
                host: "smtp.mailtrap.io",
                port: 2525,
                secure: false,
                auth: {
                    user: "44c00132c663ed",
                    pass: "b2dbc2f9371ce5"
                }
            });
            var mailOptions = {
                from: 'notifications@smartlocker.com',
                to: user.userName,
                subject: 'Smart Locker Return Notification',
                text: 
                    ' Your reservation for ' + item.itemName + ' will expire on ' + req.body.stopTime +
                    '. Click here to extend: http://10.13.86.178:4200/',
                html:
                    ' Your reservation for ' + item.itemName + ' will expire on ' + req.body.stopTime +
                    '. Click here to extend: http://10.13.86.178:4200/'
            };
            transport.sendMail(mailOptions);
            res.status(200).send("email sent");
        } else res.status(400).send("email not sent");
    } catch (error) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

// finds an object of a collection based on its ID
databaseRouter.get("/fetch/:elem/:id?/:prop?", async (req, res) => {
    try {
        const [ element, id, property ] = [ req?.params?.elem, req?.params?.id, req?.params?.prop ];
        switch ( element ) {
            case 'acct':
                if (!id) {
                    try {
                        const accounts = await collections.accounts.find({}).toArray();
                        res.status(200).send(accounts);
                    } catch (error) { res.status(500).send(error.message); }
                } else {
                    try {
                        const query = { _id: new mongodb.ObjectId(id) };                        
                        const account = await collections.accounts.findOne(query);

                        if (account) {
                            if (property) {
                                switch (property) {
                                    case 'userType': res.status(201).send(account.userType); break;
                                    default: res.status(400).send(`Unknown property of account`);
                                }
                            } else res.status(200).send(account);
                        }
                        else res.status(404).send(`Failed to find account: id ${id}`);
                    } catch (error) { res.status(404).send(`Failed to find account: id ${req?.params?.id}`); }
                }
                break;
            case 'item':
                if (!id) {
                    try {
                        const items = await collections.items.find({}).toArray();
                        res.status(200).send(items);
                    } catch (error) { res.status(500).send(error.message); }
                } else {
                    try {
                        const query = { _id: new mongodb.ObjectId(id) };
                        const item = await collections.items.findOne(query);

                        if (item) res.status(200).send(item);
                        else res.status(404).send(`Failed to find item: id ${id}`);
                    } catch (error) { res.status(404).send(`Failed to find item: id ${req?.params?.id}`); }
                }
                break;
            case 'lock':
                if (!id) {
                    try {
                        const lockers = await collections.lockers.find({}).toArray();
                        res.status(200).send(lockers);
                    } catch (error) { res.status(500).send(error.message); }
                } else {
                    try {
                        const query = { _id: new mongodb.ObjectId(id) };
                        const locker = await collections.lockers.findOne(query);

                        if (locker) res.status(200).send(locker);
                        else res.status(404).send(`Failed to find locker: id ${id}`);
                    } catch (error) { res.status(404).send(`Failed to find locker: id ${req?.params?.id}`); }
                }
                break;
            case 'rcrd':
                if (!id) {
                    try {
                        const records = await collections.records.find({}).toArray();
                        res.status(200).send(records);
                    } catch (error) { res.status(500).send(error.message); }
                } else {
                    try {
                        const query = { _id: new mongodb.ObjectId(id) };
                        const record = await collections.records.findOne(query);

                        if (record) res.status(200).send(record);
                        else res.status(404).send(`Failed to find record: id ${id}`);
                    } catch (error) { res.status(404).send(`Failed to find record: id ${req?.params?.id}`); }
                }
                break;
            case 'rsrv':
                if (!id) {
                    try {
                        const reservations = await collections.reservations.find({}).toArray();
                        res.status(200).send(reservations);
                    } catch (error) { res.status(500).send(error.message); }
                } else {
                    try {
                        const query = { _id: new mongodb.ObjectId(id) };
                        const reservation = await collections.reservations.findOne(query);

                        if (reservation) res.status(200).send(reservation);
                        else res.status(404).send(`Failed to find reservation: id ${id}`);
                    } catch (error) { res.status(404).send(`Failed to find reservation: id ${req?.params?.id}`); }
                }
                break;
            default:
                res.status(404).send(`Failed to find collection: ${req?.params?.elem}`);
        }

    } catch (error) { res.status(500).send(error.message); }
});

//  create new element
databaseRouter.post("/new/:element", async (req, res) => {
    const newElem = req.body;
    const element = req?.params?.element;

    try {
        switch ( element ) {
            case 'acct':
                const account = await collections.accounts.insertOne(newElem);

                if (account.acknowledged) res.status(201).send(`Created new account: id ${account.insertedId}`);
                else res.status(500).send("Failed to create account");
                break;
            case 'item':
                const item = await collections.items.insertOne(newElem);

                if (item.acknowledged) res.status(201).send(`Created new item: id ${item.insertedId}`);
                else res.status(500).send("Failed to create item");
                break;
            case 'lock':
                const locker = await collections.lockers.insertOne(newElem);

                if (locker.acknowledged) res.status(201).send(`Created new locker: id ${locker.insertedId}`);
                else res.status(500).send("Failed to create locker");
                break;
            case 'rcrd':
                const record = await collections.records.insertOne(newElem);

                if (record.acknowledged) res.status(201).send(`Created new record: id ${record.insertedId}`);
                else res.status(500).send("Failed to create record");
                break;
            case 'rsrv':
                const reservation = await collections.reservations.insertOne(newElem);

                if (reservation.acknowledged) res.status(201).send(`Created new reservation: id ${reservation.insertedId}`);
                else res.status(500).send("Failed to create reservation");
                break;
            default: res.status(404).send(`Failed to find collection: ${req?.params?.element}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// update existing element
databaseRouter.put("/edit/:element/:id", async (req, res) => {
    const newElem = req.body;
    const [ element, id ] = [ req?.params?.element, req?.params?.id ];
    const query = { _id: new mongodb.ObjectId(id) };

    try {
        switch ( element ) {
            case 'acct':
                const account = await collections.accounts.updateOne(query, { $set: newElem });

                if (account && account.matchedCount) res.status(200).send(`Updated account: id ${id}.`);
                else if (!account.matchedCount) res.status(404).send(`Failed to find account: id ${id}`);
                else res.status(304).send(`Failed to update account: id ${id}`); 
                break;
            case 'item':
                const item = await collections.items.updateOne(query, { $set: newElem });

                if (item && item.matchedCount) res.status(200).send(`Updated item: id ${id}.`);
                else if (!item.matchedCount) res.status(404).send(`Failed to find item: id ${id}`);
                else res.status(304).send(`Failed to update item: id ${id}`); 
                break;
            case 'lock':
                const locker = await collections.lockers.updateOne(query, { $set: newElem });

                if (locker && locker.matchedCount) res.status(200).send(`Updated locker: id ${id}.`);
                else if (!locker.matchedCount) res.status(404).send(`Failed to find locker: id ${id}`);
                else res.status(304).send(`Failed to update locker: id ${id}`); 
                break;
            case 'rcrd':
                const record = await collections.records.updateOne(query, { $set: newElem });

                if (record && record.matchedCount) res.status(200).send(`Updated record: id ${id}.`);
                else if (!record.matchedCount) res.status(404).send(`Failed to find record: id ${id}`);
                else res.status(304).send(`Failed to update record: id ${id}`); 
                break;
            case 'rsrv':
                const reservation = await collections.reservations.updateOne(query, { $set: newElem });

                if (reservation && reservation.matchedCount) res.status(200).send(`Updated reservation: id ${id}.`);
                else if (!reservation.matchedCount) res.status(404).send(`Failed to find reservation: id ${id}`);
                else res.status(304).send(`Failed to update reservation: id ${id}`); 
                break;
            default: res.status(404).send(`Failed to find collection: ${req?.params?.element}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

// delete existing element
databaseRouter.delete("/delete/:element/:id", async (req, res) => {
    const [ element, id ] = [ req?.params?.element, req?.params?.id ];
    const query = { _id: new mongodb.ObjectId(id) };

    try {
        switch ( element ) {
            case 'acct':
                const account = await collections.accounts.deleteOne(query);
        
                if (account && account.deletedCount) res.status(202).send(`Removed account: id ${id}`);
                else if (!account) res.status(400).send(`Failed to remove account: id ${id}`);
                else if (!account.deletedCount) res.status(404).send(`Failed to find account: id ${id}`);
                break;
            case 'item':
                const item = await collections.items.deleteOne(query);
        
                if (item && item.deletedCount) res.status(202).send(`Removed item: id ${id}`);
                else if (!item) res.status(400).send(`Failed to remove item: id ${id}`);
                else if (!item.deletedCount) res.status(404).send(`Failed to find item: id ${id}`);
                break;
            case 'lock':
                const locker = await collections.lockers.deleteOne(query);
        
                if (locker && locker.deletedCount) res.status(202).send(`Removed locker: id ${id}`);
                else if (!locker) res.status(400).send(`Failed to remove locker: id ${id}`);
                else if (!locker.deletedCount) res.status(404).send(`Failed to find locker: id ${id}`);
                break;
            case 'rcrd':
                const record = await collections.records.deleteOne(query);
        
                if (record && record.deletedCount) res.status(202).send(`Removed record: id ${id}`);
                else if (!record) res.status(400).send(`Failed to remove record: id ${id}`);
                else if (!record.deletedCount) res.status(404).send(`Failed to find record: id ${id}`);
               break;
            case 'rsrv':
                const reservation = await collections.reservations.deleteOne(query);
        
                if (reservation && reservation.deletedCount) res.status(202).send(`Removed reservation: id ${id}`);
                else if (!reservation) res.status(400).send(`Failed to remove reservation: id ${id}`);
                else if (!reservation.deletedCount) res.status(404).send(`Failed to find reservation: id ${id}`);
                break;
            default: res.status(404).send(`Failed to find collection: ${req?.params?.element}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});