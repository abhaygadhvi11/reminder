const express = require("express")
//import express from "express";
//const database = express();
const database = require('./database.js');
const app = express();

const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
// app.use(cors({
//   origin: "*",
//   method: ["GET","POST"],
//   // allowedHeaders: ['Content-Type','Authorization']
// }));

app.use(express.json())
// app.use(express.urlencoded({extended: false}))


const port = process.env.PORT || 5000;

/*app.post('/api/reminder', (req, res) => {
        const productname = req.query['productname'];
        const email = req.query['email'];
        const startdate = req.query['startdate'];
        const enddate = req.query['enddate'];


        console.log("productname",productname);
        console.log("email",email);
        console.log("startdate",startdate);
        console.log("enddate",enddate);

        //const { authorization } = req.headers; 
        res.send(
            {
                productname,
                email,
                startdate,
                enddate
            });
    });*/

app.post('/api/reminder', (req, res) => {
  const productname = req.query['productname'];
  const email = req.query['email'];
  const startdate = req.query['startdate'];
  const enddate = req.query['enddate'];


  if (productname || email || startdate) {
    return res.status(400).send('Please provide productname, email, startdate, enddate');
  }

  const sql = 'INSERT INTO users (productname, email, startdate, enddate) VALUES (?, ?, ?, ?)';
  const values = [productname, email, startdate, enddate];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      console.log('Failed to insert data');
    }

    console.log(`User added successfully with ID: ${result.insertId}`);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
