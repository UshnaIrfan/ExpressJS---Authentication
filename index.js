const mongoose = require("mongoose");
const express = require('express');
const app = express();
const router = require('express').Router();
require('dotenv').config()
const port = process.env.PORT ||8000;
const connection=process.env.DATABASE_STRING
const usersRouter = require('./routes/blogRoutes');
// parses incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', usersRouter);

//server connection
mongoose.set('strictQuery', true);
mongoose.connect(connection,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>{
    console.log("connection established ")
}).catch(()=>{
    console.log("no connection")
})
app.listen(port ,() =>
{
    console.log(`Connection successfully running ${process.env.DATABASE_STRING} on port: ${port}`);
})
module.exports = app;
