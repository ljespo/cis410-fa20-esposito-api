const express = require('express');
const bcrypt = require('bcryptjs')
const db = require('./dbConnectExec.js');
const app = express();
const cors = require('cors');


//azurewebsites.net, colostate.edu
app.use(cors())
app.use(express.json())


app.post("/participants", async (req,res)=>{
    // res.send("Creating user")
    // console.log("request body", req.body)

    var nameFirst = req.body.nameFirst;
    var nameLast = req.body.nameLast;
    var email = req.body.email;
    var password = req.body.password;

    if(!nameFirst || !nameLast || !email || !password){
        return res.status(400).send("bad request")
    }

    nameFirst = nameFirst.replace("'","''")
    nameLast = nameLast.replace("'","''")

    var emailCheckQuery = `SELECT email
    FROM Participant
    WHERE email = '${email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    // console.log("existing user", existingUser)
    if(existingUser[0]){
        return res.status(409).send('Please enter a different email.')
    }

    var hashedPassword = bcrypt.hashSync(password)

    var insertQuery = `INSERT INTO Participant(nameFirst, nameLast, email, password)
    VALUES('${nameFirst}', '${nameLast}', '${email}', '${hashedPassword}')`

    db.executeQuery(insertQuery).then(()=>{
        res.status(201).send()
        .catch((err)=>{
            console.log("error in POST/participants", err)
            res.status(500).send()
        })
    })
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


const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{console.log(`app is running on port ${PORT}`)})