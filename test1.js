const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: 'abhay5678', 
  database: 'project1' 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database.');
  }
});

app.post('/api/reminder', (req, res) => {
  const { productname, email, startdate, enddate } = req.body;

  if (!productname || !email || !startdate || !enddate) {
    return res.status(400).json({ message: 'Please provide productname, email, startdate and enddate.' });
  }

  const query = 'INSERT INTO information (productname, email, startdate, enddate) VALUES (?, ?, ?)'; 
  db.query(query, [productname, email, startdate, enddate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ message: 'Failed to insert data into the database.' });
    } else {
      res.status(201).json({ message: 'User added successfully!', userId: result.insertId });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
