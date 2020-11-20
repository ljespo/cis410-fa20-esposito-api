const jwt = require('jsonwebtoken')

const db = require('../dbConnectExec.js')
const config = require('../config.js')

const auth = async(req, res,next)=>{
    try{

        //decode token
        let myToken = req.header('Authorization').replace('Bearer ','')

        //compare token with db
        let decodedToken = jwt.verify(myToken, config.JWT)

        let participantPK = decodedToken.pk;

        let query = `SELECT ParticipantPK, nameFirst, nameLast, email
        FROM Participant
        WHERE ParticipantPK = ${participantPK} and Token = '${myToken}'`

        let returnedUser = await db.executeQuery(query)
        //save user infomation in request
        if(returnedUser[0]){
            req.participant = returnedUser[0];
            next()
        }else{res.status(401).send('Authentication Failed.')}

    }catch(myError){
        res.status(401).send("Authentication Failed.")
    }
}

module.exports = auth