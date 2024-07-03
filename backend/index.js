const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mainRouter = require("./routes/index");
const dotenv = require("dotenv");


const port = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(dotenv());

app.use("/api/v1/", mainRouter);

app.use((req, res) => {
    res.status(400).json({
        msg:"Internal server error."
    });
})

app.listen(port);
