const express = require("express");
const app = express();
var mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser')
const bcrypt = require("bcrypt");
const saltRounds = 10;
const session = require("express-session");
const cookieParser = require('cookie-parser');

app.listen(30013, ()=> {console.log(`Server started on port 30013`)});
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());
app.use(express.json())
app.use(cors({origin: ["http://localhost:3000"], methods: ["GET", "POST"], credentials: true}))
app.use(session({key: "userLogin", secret: "dfrhkiu8W3F3DF4DFF66FD534tiu43v 74ndgvkjmc pa,d;ad;74ajmi7w012uLKNfdf74HFB3590SNDGgR7SIHl~ANE", resave: false, saveUninitialized: false, cookie: {expires: (60*60*24*60)}}, ))

// database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'donation_station'
});

// sign up for an account
app.post("/signUp",  (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const location = req.body.location;

    // check whether username already exists
    db.query("select userId from users where binary username = ?", [username], (err, result)=>{
      if (err){console.log(err)}
  
      if (result.length == 0){
  
        // encrypt password
        bcrypt.hash(password, saltRounds, (err, hash)=>{
  
          if (err){console.log(err)}
  
          // add encrypted password to database
          db.query("insert into users(username, password, formattedAddress, coordinates) values(?, ?, ?, ?)", [username, hash, location.formattedAddress, location.coordinates], (err, result)=>{
  
            if (err){console.log(err)}
  
            // create session for user and send userId
            req.session.user = {userId: result.insertId, username: username};
            res.send({user: {userId: result.insertId, username: username, coordinates: location.coordinates, formattedAddress: location.formattedAddress}})
          })
  
        })
      }
      else{
        res.send("username in use")
      }
    })
  
})

// sign out by deleting session
app.post("/signout",  (req, res) => {
    req.session.user = null
    res.send("ok")
})

// retrieve login session
app.get("/login",  (req, res) => {
    res.send({user: req.session.user})
})

// login
app.post("/login",  (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    db.query(`select * from users where binary username = ?`, [username], (err, result) => {
      if (err){console.log(err)}
  
      if (result.length > 0){
  
        bcrypt.compare(password, result[0].password, (err, response)=>{
          if (err){console.log(err)}
    
          if (response){
    
            req.session.user = result[0];
            res.send({user: result[0]})
          }
    
          else{
            res.send("Wrong combo")
          }
        })
      }
  
      else{
        res.send("Wrong combo")
      }
    })
})

// adding donation request to database
app.post("/requestDonation",  (req, res) => {
    const userId = req.body.userId;
    const location = req.body.location;
    const additionalNotes = req.body.additionalNotes;
    const specificProductRequest = req.body.specificProductRequest;
    const donationPickUpTime = req.body.donationPickUpTime;
    const donationType = req.body.donationType;

    db.query(`insert into donation_requests(userId, formattedAddress, coordinates, specificProductRequest, additionalNotes, donationType, donationPickUpTime) values(?, ?, ?, ?, ?, ?, ?)`, 
    [userId, location.formatted_address, location.coordinates, specificProductRequest, additionalNotes, donationType, donationPickUpTime], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationRequestId: result.insertId})
        }
    })
})

// adding donation to database
app.post("/addDonation",  (req, res) => {
    const userId = req.body.userId;
    const location = req.body.location;
    const additionalNotes = req.body.additionalNotes;
    const specificDonation = req.body.specificDonation;
    const donationDropOffTime = req.body.donationDropOffTime;
    const donationType = req.body.donationType;

    db.query(`insert into donations(userId, formattedAddress, coordinates, specificDonation, additionalNotes, donationType, donationDropOffTime) values(?, ?, ?, ?, ?, ?, ?)`, 
    [userId, location.formatted_address, location.coordinates, specificDonation, additionalNotes, donationType, donationDropOffTime], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationId: result.insertId})
        }
    })
})

// get donation requests from database
app.post("/getDonationRequests",  (req, res) => {
    const userId = req.body.userId;

    db.query(`select * from donation_requests where userId != ?`, [userId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationRequests: result})
        }
    })
})

// get donations from database
app.post("/getDonations",  (req, res) => {
    const userId = req.body.userId;

    db.query(`select * from donations where userId != ?`, [userId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donations: result})
        }
    })
})

// get donation requests made by user from database
app.post("/getUserDonationRequests",  (req, res) => {
    const userId = req.body.userId;

    db.query(`select * from donation_requests where userId = ?`, [userId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationRequests: result})
        }
    })
})

// get donations made by the user from database
app.post("/getUserDonations",  (req, res) => {
    const userId = req.body.userId;

    db.query(`select * from donations where userId = ?`, [userId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donations: result})
        }
    })
})

// delete donation request from database given donation request ID
app.post("/deleteDonationRequest",  (req, res) => {
    const donationRequestId = req.body.donationRequestId;

    db.query(`delete from donation_requests where donationRequestId = ?`, [donationRequestId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send("ok")
        }
    })
})

// delete donation offer from database given donation offer ID
app.post("/deleteDonations",  (req, res) => {
    const donationId = req.body.donationId;

    db.query(`delete from donations where donationId = ?`, [donationId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send("ok")
        }
    })
})
  
// get info of one donation request
app.post("/getDonationRequestInfo",  (req, res) => {
    const donationRequestId = req.body.donationRequestId;

    db.query(`select donation_requests.*, users.username from donation_requests left join users on users.userId = donation_requests.userId where donation_requests.donationRequestId = ?`, [donationRequestId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationRequestInfo: result[0]})
        }
    })
})

// get info of one donation offer
app.post("/getDonationOfferInfo",  (req, res) => {
    const donationId = req.body.donationId;

    db.query(`select donations.*, users.username from donations left join users on users.userId = donations.userId where donations.donationId = ?`, [donationId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({donationOfferInfo: result[0]})
        }
    })
})

// get messages of one donation request/offer
app.post("/getDonationMessages",  (req, res) => {
    const donationId = req.body.donationId;
    const type = req.body.type;

    db.query(`select messages.*, users.username from messages left join users on users.userId = messages.messagerId where messages.originalPostId = ? and type = ?`, [donationId, type], (err, result) => {
        if (err){console.log(err)}
    
        else{
            res.send({messages: result})
        }
    })
})

// get donation offer suggestions of one donation request
app.post("/getDonationOfferSuggestions",  (req, res) => {
    const donationRequestType = req.body.donationRequestType;

    db.query(`select donations.*, users.username from donations left join users on users.userId = donations.userId where donations.donationType = ?`, [donationRequestType], (err, result) => {
        if (err){console.log(err)}
    
        else{
            res.send({donationOfferSuggestions: result})
        }
    })
})

// get donation request suggestions of one donation offer
app.post("/getDonationRequestSuggestions",  (req, res) => {
    const donationOfferType = req.body.donationOfferType;

    db.query(`select donation_requests.*, users.username from donation_requests left join users on users.userId = donation_requests.userId where donation_requests.donationType = ?`, [donationOfferType], (err, result) => {
        if (err){console.log(err)}
    
        else{
            res.send({donationRequestSuggestions: result})
        }
    })
})

// adding message to database
app.post("/postMessage",  (req, res) => {
    const messagerId = req.body.messagerId;
    const originalPostId = req.body.originalPostId;
    const type = req.body.type;
    const message = req.body.message;

    db.query(`insert into messages(messagerId, originalPostId, type, message) values(?, ?, ?, ?)`, 
    [messagerId, originalPostId, type, message], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send({messageId: result.insertId})
        }
    })
})

// change address in database
app.post("/saveAddress",  (req, res) => {
    const location = req.body.location;
    const userId = req.body.userId

    db.query(`update users set coordinates = ?, formattedAddress = ? where userId = ?`, 
    [location.coordinates, location.formattedAddress, userId], (err, result) => {
        if (err){console.log(err)}

        else{
            res.send("ok")
        }
    })
})

// change password in database
app.post("/savePassword",  (req, res) => {
    const currPassword = req.body.currPassword;
    const newPassword = req.body.newPassword;
    const userId = req.body.userId

    // check if current password correct
    db.query(`select password from users where userId = ?`, [userId], (err, result) => {
        if (err){console.log(err)}

        else{
            bcrypt.compare(currPassword, result[0].password, (err, response)=>{
                if (err){console.log(err)}
          
                if (response){

                    // encrypt new password
                    bcrypt.hash(newPassword, saltRounds, (err, hash)=>{
            
                        if (err){console.log(err)}
                        
                        // add encrypted password to database
                        db.query(`update users set password = ? where userId = ?`, [hash, userId], (err, result) => {
                            if (err){console.log(err)}
                    
                            else{
                                res.send("ok")
                            }
                        }) 
                    })
                }

                else{
                  res.send("Wrong password")
                }
            })
        }
    })
})
