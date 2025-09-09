import  express  from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';
import authRoutes from './route';
import { error } from "console";
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin:'http://localhost:5173', 
    credentials: true
}))

app.use('/api/auth', authRoutes);
const dbURL = process.env.DATABASE_URL;
if (!dbURL) {
  throw new Error("FATAL ERROR: DATABASE_URL is not defined in the environment.");
}

mongoose
    .connect(dbURL)
    .then(() => {
        console.log('DB connected');
        app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('DB connection err:' ,error);
    });


