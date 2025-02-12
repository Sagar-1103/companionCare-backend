import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import userRouter from "./src/routes/user.routes.js";
import chatRouter from "./src/routes/chat.routes.js";
import medicationRouter from "./src/routes/medication.routes.js";
import geoRouter from "./src/routes/geo.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
    origin:"*",
}))

app.use(cookieParser());

app.route("/").get(async(req,res)=>{
    res.status(200).json({"Companion Care Backend":"Connected"})
});

app.use("/users",userRouter);
app.use("/chats",chatRouter);
app.use("/medications",medicationRouter);
app.use("/geolocation",geoRouter);

app.listen(PORT, () => {
    console.log(`Gateway Server Running on port ${PORT}`);
  });