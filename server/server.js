import express from "express";
import cors from "cors";
import { readdirSync } from "fs";
import mongoose from 'mongoose';
const morgan = require("morgan");

require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

readdirSync("./routes").map((r) =>
    app.use("/api", require(`./routes/${r}`))
);

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
