const express = require('express');
const dbConnectExec = require('./dbConnectExec');
const db = require('./dbConnectExec.js')
const app = express();

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

app.get("/cars/:pk", (req,res)=>{
    var pk = req.params.pk
    
    var myQuery = `SELECT *
    FROM car
    WHERE carPK = ${pk}`

    db.executeQuery(myQuery)
        .then((carSelect)=>{
            if(carSelect[0]){
                res.send(carSelect[0])
            }else{res.status(404).send('bad request')}
        })
        .catch((err)=>{
            console.log("Error in /cars/pk", + err)
            res.status(500).send()
        })
})

app.listen(5000,()=>{console.log("app is running on port 5000")})