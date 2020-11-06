const express = require('express');
const dbConnectExec = require('./dbConnectExec');
const db = require('./dbConnectExec.js')
const app = express();

app.get("/hi",(req,res)=>{
    res.send("hello world")
})

app.get("/cars", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT *
    FROM car`)
.then((result)=>{
    res.status(200).send(result)
    })
.catch((err)=>{
    console.log(err);
    res.status(500).send()
    })
})

app.listen(5000,()=>{console.log("app is running on port 5000")})