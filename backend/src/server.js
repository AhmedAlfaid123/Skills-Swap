const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profile.routes");
const discoveryRoutes = require("./routes/Discovery.routes");
const matchingRoutes = require("./routes/matching.routes");
const connectDB = require("./config/db");
const app = express();
connectDB();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/api/auth" , authRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", matchingRoutes);
app.listen(process.env.PORT , ()=>{
    console.log("Server is running on port 5000");
})