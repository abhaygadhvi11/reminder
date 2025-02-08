const port = process.env.PORT || 5000;

const express = require('express');
const mysql = require('mysql2');
const database = require('./database.js');
//const cors = require('cors');

const app = express();
const p = 4002;

// Middleware
//app.use(cors());
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));



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

    // Create the 'tasks' table if it does not exist, including all required columns
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL,
            startdate DATE NOT NULL,
            enddate DATE NOT NULL
        )`;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Tasks table is ready');
        }
    });
});

  // Create the 'activity' table if it does not exist and link it to tasks
  const createActivityTable = `
  CREATE TABLE IF NOT EXISTS activity (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tasks_id INT AUTO_INCREMENT,
      date DATE NOT NULL,
      email VARCHAR(100) NOT NULL,
      description VARCHAR(255) NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )`;

db.query(createActivityTable, (err) => {
  if (err) {
      console.error('Error creating activity table:', err);
  } else {
      console.log('Activity table is ready and linked to tasks table');
  }
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

//GET: Fetch all tasks form a specific id

app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tasks not found' });
        }
        res.json(results[0]); 
    });
})


// GET: Fetch a specific column value by ID
/*app.get('/api/tasks/:id/:activity', (req, res) => {
    const { id, activity } = req.params;

    const allowedColumns = ['description', 'email', 'startdate', 'enddate'];
    if (!allowedColumns.includes(activity)) {
        return res.status(400).json({ error: 'Invalid column name' });
    }

    const sql = `SELECT ?? FROM tasks WHERE id = ?`;
    db.query(sql, [activity, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(results[0]);
    });
});*/

//GET: Fetch all activites form a specific id
app.get('/api/tasks/:id/activites', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            tasks.id AS tasks_id,
            tasks.startdate AS task_startdate, 
            tasks.enddate AS task_enddate, 
            tasks.email AS task_email, 
            tasks.description AS task_description,
            activity.id AS activity_id,
            activity.date AS activity_date, 
            activity.email AS activity_email, 
            activity.description AS activity_description
            FROM activity
        JOIN tasks ON activity.tasks_id = tasks.id
        WHERE tasks.id = ?   
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(results); 
    });
});

/*app.get('/api/tasks/:id/actvities', (req, res)=> 
{
   const  results = {
    taskid: 1,
    description: "abc",
    startdate: "1-2-3",
    enddate: "1-2-3",
    email: "a@a",
    activities: [
        {
            activityid: 8,
            task_id:1, 
            email:"abc@gmail.com",
            description:"sdfsdfs",
            date:"2024-1-12"
        },
        {
            activityid: 11,
            tasks_id:1,
            email:"abc@gmail.com",
            date:"2024-12-12"
        }
    ]
   };
    res.json(results);
});*/

// POST: Add a new task
app.post('/api/tasks', (req, res) => {
    const { description, email, startdate, enddate } = req.body;

    // Validate input data
    if (!description || !email || !startdate || !enddate) {
        return res.status(400).json({ error: 'Description, Email, Start Date, and End Date are required' });
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

// POST: Add a new activity   
app.post('/api/tasks/:id/activities', (req, res) => {
    const { id: tasks_id } = req.params; 
    const { activities } = req.body; 

    if (!Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ error: 'Array of activities is required' });
    }

    const values = activities.map(({ date, email, description }) => [tasks_id, date, email, description]);

    const sql = 'INSERT INTO activity (tasks_id, date, email, description) VALUES ?';

    db.query(sql, [values], (err, result) => {   
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Activities added successfully', affectedRows: result.affectedRows });
    });
});       
              

app.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});   

