//const port = process.env.PORT || 5000;
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const database = require('./database.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
//const cors = require('cors');
const dotenv = require('dotenv');
bcrypt.setRandomFallback(require('crypto').randomBytes);
const jwtSecret = process.env.JWT_SECRET;


dotenv.config();
const app = express();
const p = 4002;

// Middleware
//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

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
            enddate DATE NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

//create the users table to store the users
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL 
)`;

db.query(createUsersTable, (err) => {
if (err) {
    console.error('Error creating users table:', err);
} else {
    console.log('Users table is ready');
}
});

//token verification 
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
   //console.log("Authorization Header:", token); 
    
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err); 
        res.status(401).json({ error: "Invalid token" });
    }
};

//POST: signup user 
// Set fallback for random value generation 
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        //const salt = await bcrypt.genSalt(10); // Generate salt
        //const hashedPassword = await bcrypt.hash(password, salt); // Hash password with generated salt
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
        db.query(sql, [email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'User registered successfully', id: result.insertId });
        });

    } catch (error) {
        console.error('Error during password hashing:', error);
        res.status(500).json({ error: 'Server error' });
    } 
});                                                                     

// POST: Login user
app.post('/api/login', (req, res) => {
    const {id, email, password } = req.body;
    if (!id || !email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = 'SELECT * FROM users WHERE id = ? AND email = ?';
    db.query(sql, [id,email], async (err, results) => {   
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id,email: user.email }, process.env.JWT_SECRET, { expiresIn: '10h' });
        res.json({ token });
    });
}); 

// GET: Fetch all tasks
app.get('/api/tasks' , verifyToken , (req, res) => {  
    const { f } = req.query;            
     
    let sql = 'SELECT * FROM tasks ORDER BY enddate ASC';
    if (f == 1) {
        sql = `SELECT * FROM tasks WHERE enddate >= CURDATE() AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY ) ORDER BY enddate ASC`;
    } else if (f == 2) {
        sql = `SELECT * FROM tasks WHERE enddate >= CURDATE() AND enddate <= DATE_ADD(CURDATE(), INTERVAL 31 DAY) ORDER BY enddate ASC`;
    } 

    db.query(sql, (err, results) => {        
        if (err) {        
            return res.status(500).json({ error: err.message });
        }
        res.json(results);      
    });
});                    

// GET: Fetch all tasks for a specific user_id
app.get('/api/tasks/user/:user_id', verifyToken, (req, res) => {
    const { user_id } = req.params;

    const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY enddate ASC';
    db.query(sql, [user_id], (err, results) => {
        if (err) {  
            return res.status(500).json({ error: err.message });
        }                 
        if (results.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this user' });
        }
        res.json(results);  
    });
});      

//GET: Fetch all tasks form a specific id  
/*app.get('/api/tasks/:id', (req, res) => {  
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
})*/


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
app.get('/api/tasks/:id/activities', (req, res) => { 
    const { id } = req.params;
    const sql = `
        SELECT 
            tasks.id AS taskid,
            tasks.startdate, 
            tasks.enddate, 
            tasks.email, 
            tasks.description,
            activity.id AS activityid,
            activity.date, 
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
            return res.status(404).json({ error: 'No activities found for this task' });
        }

        const result = {
            taskid: results[0].taskid,
            description: results[0].description,
            startdate: results[0].startdate,
            enddate: results[0].enddate,
            email: results[0].email,
            activities: results.map(activity => ({
                activityid: activity.activityid,
                task_id: activity.taskid,
                email: activity.activity_email,
                description: activity.activity_description || null, 
                date: activity.date
            }))
        };

        res.json(result);
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
    const { date, email, description } = req.body;    
                                                      
    if (!date || !email || !description) {
        return res.status(400).json({ error: 'Date, email, and description are required' });
    }

    const sql = 'INSERT INTO activity (tasks_id, date, email, description) VALUES (?, ?, ?, ?)';

    db.query(sql, [tasks_id, date, email, description], (err, result) => {   
        if (err) {
            console.error('Error inserting data:', err); 
            return res.status(500).json({ error: err.message });  
        }
        res.json({ message: 'Activity added successfully', insertedId: result.insertId });
    });
});       
           
//PUT: Edit an acitvity by :id
/*app.put('/api/activites/:id',(req,res) =>{
    const {id} = req.params;
    const {date,email,description} = req.body;

    if(!date || !email || !description){
        return res.status(400).json({"date,email and description are requried"});
    }
}

const sql= 'UPDATE activity SET date = ?, email = ?, description = ? WHERE id = ?';

db.query(sql,[date,email,description])

)*/

app.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});   

