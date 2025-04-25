import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURl = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true,
}))
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("uploads/files", express.static("uploads/files"));
app.use("/create-channel",channelRoutes);

const server = app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});


setupSocket(server);
//setUpPlayerSocket(server);

mongoose.connect(databaseURl).then(()=>console.log('DB Connection Successful'))
.catch((err)=> console.log(err.message));