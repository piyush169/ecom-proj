import  express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import router from "./route";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("FATAL ERROR: DATABASE_URL is not defined in the environment.");
}


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5173',
    credentials: true
}));

app.use("/api/products", router);

mongoose
    .connect(databaseUrl)
    .then(()=>{
        console.log("Connected to mongoDB");
        app.listen(PORT, () => {
            console.log(`Product service running on http://localhost:${PORT}`);
        })
    })
    .catch((err) => {
        console.error("MongoDB connection failed:" , err.message);
        process.exit(1);
    });


