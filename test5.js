const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const p = 4001;

// Middleware
app.use(cors()); // Enable CORSv
app.use(express.json()); // Allow JSON request body parsing

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abhay5678',
    database: 'project1'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');

    // Create the 'tasks' table if it does not exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255),
            email VARCHAR(100),
            startdate DATE,
            enddate DATE
        )`;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Tasks table is ready');
        }
    });
});

// GET: Fetch all tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST: Add a new task
app.post('/api/tasks', (req, res) => {
    const { description, email, startdate, enddate } = req.body;

    // Validate input data
    if (!description || !email || !startdate || !enddate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO tasks (description, email, startdate, enddate) VALUES (?, ?, ?, ?)';
    db.query(sql, [description, email, startdate, enddate], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});

// Start the server
app.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});
