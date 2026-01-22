import express from "express";
import cors from "cors";
import { json } from "body-parser";
import path from "path";
import dotenv from "dotenv";
import route from "../routes/route";
import connectDB from "../config/db";

connectDB();

dotenv.config({
  path: path.resolve(__dirname, "..", "config", "config.env"),
});

const PORT = process.env.PORT || 8080;

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(json());
app.use(express.urlencoded({ extended: true }));

//const allowedOrigins = [
//    process.env.CLIENT_URL || "http://localhost:5173",
//    "https://ai-nutrition-chat.netlify.app/"
//];
//
//app.use(cors({
//    origin: function (origin, callback) {
//        if (!origin || allowedOrigins.includes(origin)) {
//            callback(null, true);
//        } else {
//            callback(new Error("Not allowed by CORS"));
//        }
//    },
//    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//    allowedHeaders: ["Content-Type", "Authorization"],
//    credentials: true,
//}));

app.use("/api/v1", route);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
