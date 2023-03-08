import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { connectToDatabase } from "./database";
import { databaseRouter } from "./database.routes";

// load environment variables from the .env file
dotenv.config();
const { ATLAS_URI } = process.env;
if (!ATLAS_URI) {
   console.error("No ATLAS_URI environment variable has been defined in config.env");
   process.exit(1);
}

connectToDatabase(ATLAS_URI)
    .then(() => {
        const app = express();
        app.use(cors());

        // start the Express server
        app.use("", databaseRouter);
        app.listen(5200, "0.0.0.0", () => {
            console.log(`Server running at http://localhost:5200...`);
        });

   })
   .catch(error => console.error(error));