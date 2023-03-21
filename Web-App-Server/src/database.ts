import * as mongodb from "mongodb";

import { Account, Item, Locker, Record, Reservation} from "./interfaces";

// list of collections in a database cluster
export const collections: {
    accounts?: mongodb.Collection<Account>;
    items?: mongodb.Collection<Item>;
    lockers?: mongodb.Collection<Locker>;
    reservations?: mongodb.Collection<Reservation>;
    records?: mongodb.Collection<Record>;
} = {};

// connects to database for interactions
export async function connectToDatabase(uri: string) {
    // create new client object to connect to database
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    // use client to connect to database
    const db = client.db("smart-locker");
    await applySchemaValidationAccounts(db);
    await applySchemaValidationItems(db);
    await applySchemaValidationLockers(db);
    await applySchemaValidationReservations(db);
    await applySchemaValidationRecords(db);

    // assign collections to list of collections
    const accountsCollection = db.collection<Account>("accounts");
    collections.accounts = accountsCollection;
    const itemsCollection = db.collection<Item>("items");
    collections.items = itemsCollection;
    const lockersCollection = db.collection<Locker>("lockers");
    collections.lockers = lockersCollection;
    const reservationsCollection = db.collection<Reservation>("reservations");
    collections.reservations = reservationsCollection;
    const recordsCollection = db.collection<Record>("records");
    collections.records = recordsCollection;
}
 
// Update existing collection with JSON schema validation to always match documents
async function applySchemaValidationAccounts(db: mongodb.Db) {
    // schema validation
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["userName", "password", "userType", "userRFID", "foreName", "lastName"],
            additionalProperties: false,
            properties: {
                _id: {},
                userName: {
                    bsonType: "string",
                    description: "'userName' is required and is a string",
                    unique: true,
                    minlength: 3
                },
                password: {
                    bsonType: "string",
                    description: "'password' is required and is a string",
                    minLength: 5
                },
                userType: {
                    bsonType: "string",
                    description: "'userType' is required and is either 'manager' or 'customer'",
                    enum: ["manager", "customer"],
                },
                userRFID: {
                    bsonType: "string",
                    description: "'userRFID' is required and is a string",
                    minLength: 10,
                    maxLength: 10
                },
                foreName: {
                    bsonType: "string",
                    description: "'foreName' is required and is a string",
                    minLength: 1
                },
                lastName: {
                    bsonType: "string",
                    description: "'lastName' is required and is a string",
                    minLength: 1
                },
            },
        },
    };
 
    // apply collection change OR create nonexisting collection
    await db.command({
        collMod: "accounts",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection("accounts", {validator: jsonSchema});
        }
    });
}

async function applySchemaValidationItems(db: mongodb.Db) {
    // schema validation
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["itemName", "itemDesc", "itemIcon", "itemLock", "itemFree"],
            additionalProperties: false,
            properties: {
                _id: {},
                itemName: {
                   bsonType: "string",
                   description: "'itemName' is required and is a string",
                   unique: true,
                   minlength: 3,
                },
                itemDesc: {
                   bsonType: "string",
                   description: "'itemDesc' is required and is a string"
                },
                itemIcon: {
                   bsonType: "string",
                   description: "'itemIcon' is required and is a string"
                },
                itemLock: {
                    bsonType: "string",
                    description: "'itemLock' is required and is a string",
                 },
                 itemFree: {
                    bsonType: "boolean",
                    description: "'itemFree' is required and is a boolean"
                 },
            },
        },
    };
 
    // apply collection change OR create nonexisting collection
    await db.command({
        collMod: "items",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("items", {validator: jsonSchema});
        }
    });
}

// Update existing collection with JSON schema validation to always match documents
async function applySchemaValidationLockers(db: mongodb.Db) {
    // schema validation
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["lockName", "lastOpen", "lastShut"],
            additionalProperties: false,
            properties: {
                _id: {},
                lockName: {
                   bsonType: "string",
                   description: "'lockName' is required and is a string",
                   unique: true
                },
                lastOpen: {
                   bsonType: "string",
                   description: "'lastOpen' is required and is a string"
                },
                lastShut: {
                   bsonType: "string",
                   description: "'lastShut' is required and is a string"
                },
            },
        },
    };

    // apply collection change OR create nonexisting collection
    await db.command({
        collMod: "lockers",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("lockers", {validator: jsonSchema});
        }
    });
}

// Update existing collection with JSON schema validation to always match documents
async function applySchemaValidationReservations(db: mongodb.Db) {
    // schema validation
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["itemID", "userID", "strtTime", "stopTime", "pickedUp"],
            additionalProperties: false,
            properties: {
                _id: {},
                itemID: {
                    bsonType: "string",
                    description: "'itemID' is required and is a string",
                    minlength: 3
                },
                userID: {
                    bsonType: "string",
                    description: "'userID' is required and is a string",
                    minlength: 3
                },
                strtTime: {
                   bsonType: "number",
                   description: "'strtTime' is required and is a number"
                },
                stopTime: {
                   bsonType: "number",
                   description: "'stopTime' is required and is a number"
                },
                pickedUp: {
                    bsonType: "boolean",
                    description: "'pickedUp' is required and is a boolean"
                 },
            },
        },
    };
 
    // apply collection change OR create nonexisting collection
    await db.command({
        collMod: "reservations",
         validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("reservations", {validator: jsonSchema});
        }
    });
}

// Update existing collection with JSON schema validation to always match documents
async function applySchemaValidationRecords(db: mongodb.Db) {
    // schema validation
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["itemID", "userID", "expect", "actual", "pickedUp", "itemCond", "comments"],
            additionalProperties: false,
            properties: {
                _id: {},
                itemID: {
                    bsonType: "string",
                    description: "'itemID' is required and is a string"
                },
                userID: {
                    bsonType: "string",
                    description: "'userID' is required and is a string"
                },
                expect: {
                   bsonType: "number",
                   description: "'expect' is required and is a number"
                },
                actual: {
                   bsonType: "string",
                   description: "'actual' is required and is a string"
                },
                pickedUp: {
                    bsonType: "boolean",
                    description: "'pickedUp' is required and is a boolean"
                 },
                 itemCond: {
                    bsonType: "number",
                    description: "'itemCond' is required and is a number"
                 },
                 comments: {
                    bsonType: "string",
                    description: "'comments' is required and is a string"
                 },
            },
        },
    };
 
    // apply collection change OR create nonexisting collection
    await db.command({
        collMod: "records",
         validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
           await db.createCollection("records", {validator: jsonSchema});
        }
    });
}