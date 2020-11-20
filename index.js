const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./dbConnectExec.js');
const config = require('./config.js')
const auth = require('./middleware/authenticate')
const app = express();
const cors = require('cors');



//azurewebsites.net, colostate.edu
app.use(cors())
app.use(express.json())

app.get('/participants/me', auth, (req,res)=>{
    res.send(req.participant)
})

app.post('/participants/logout', auth, (req,res)=>{
     var query = `UPDATE Participant
     SET token = NULL
     WHERE ParticipantPK = ${req.participant.ParticipantPK}`

     db.executeQuery(query)
     .then(()=>{res.send(200).send()})
     .catch((error)=>{console.log("error in POST /participants/logout")
        res.status(500).send()
    })
})

app.post('/car', auth, async (req,res)=>{
    
    try{var year = req.body.year;
        var make = req.body.make;
        var model = req.body.model;
    
        if(!year || !make || !model){res.status(400).send("bad request")}

        let insertQuery = `INSERT INTO Car(Year, Make, Model, ParticipantFK)
        OUTPUT inserted.CarPK, inserted.Year, inserted.Make, inserted.Model
        VALUES('${year}', '${make}', '${model}', ${req.participant.ParticipantPK})`   
    

        let insertedCar = await db.executeQuery(insertQuery)
        // console.log(insertedCar)
        res.status(201).send(insertedCar[0])
    }
        catch(error){
            console.log("error in POST /cars/new", error)
            res.status(500).send()
        }

})

app.get('/car/me', auth, async (req,res)=>{
    
    let ParticipantPK = req.participant.ParticipantPK;

    var query = `SELECT *
    FROM Car
    WHERE ParticipantFK = '${ParticipantPK}'`

    let result;

    try{
        result = await db.executeQuery(query);
        res.status(200).send(result)
   }catch(myError){
       console.log('error in /car/me', myError);
       return res.status(500).send()
   }
})

app.get("/", (req,res)=>{
    res.send("Hello World!")
})

app.post("/participants/login", async (req,res)=>{

   var email = req.body.email;
   var password = req.body.password;

   if(!email || !password){
       return res.status(400).send('bad request')
   }
   //check user email exists
   var query = `SELECT *
   FROM Participant
   WHERE email = '${email}'`

   let result;

   try{
        result = await db.executeQuery(query);
   }catch(myError){
       console.log('error in /participants/login:', myError);
       return res.status(500).send()
   }

   if(!result[0]){return res.status(400).send('Invalid user credentials')}

   //check their password matches
   let user = result[0]

   if(!bcrypt.compareSync(password,user.password)){
       console.log("Invalid password")
       return res.status(400).send("Invalid user credentials")
   }
   
   //generate a token
    let token = jwt.sign({pk: user.ParticipantPK}, config.JWT, {expiresIn: '60 minutes'})

   //save token in database and send token and user info back to user
   let setTokenQuery = `UPDATE Participant
   SET Token = '${token}'
   WHERE ParticipantPK = ${user.ParticipantPK}`

   try{
        await db.executeQuery(setTokenQuery)
        res.status(200).send({
            token: token,
            user: {
                nameFirst: user.nameFirst,
                nameLast: user.nameLast,
                email: user.email,
                ParticipantPK: user.ParticipantPK
            }
        })
   }
   catch(myError){
       console.log("error setting user token ", myError);
       res.status(500).send()
   }

})

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

    db.executeQuery(insertQuery)
    .then(()=>{res.status(201).send()})
        .catch((err)=>{
            console.log("error in POST /participants", err)
            res.status(500).send()
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