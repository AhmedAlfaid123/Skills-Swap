const express = require("express");
const cors = require("cors");
require("dotenv").config({path: '../.env'});
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth" , authRoutes);
app.listen(process.env.PORT , ()=>{
    console.log("Server is running on port 5000");
})