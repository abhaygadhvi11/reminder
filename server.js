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
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Access denied, no token provided' });
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = { id: decoded.id, email: decoded.email };
        next();
    });
};

module.exports = verifyToken;   


//POST: signup user 
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        //const salt = await bcrypt.genSalt(10);
        //const hashedPassword = await bcrypt.hash(password, salt); 
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
    const {email, password } = req.body;
    if (!email || !password) {       
        return res.status(400).json({ error: 'Email and password are required' });     
    } 

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {   
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

// POST: Add a new task
app.post('/api/tasks', verifyToken , (req, res) => {
    const { description, email, startdate, enddate } = req.body;  
    const user_id = req.user.id; 

    if (!description || !email || !startdate || !enddate) {
        return res.status(400).json({ error: 'Description, email, Start Date, and End Date are required' });
    }

    const sql = 'INSERT INTO tasks (description, email, startdate, enddate, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [description, email, startdate, enddate,user_id], (err, result) => { 
        if (err) {
            console.error('Error inserting data:', err);   
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});


//GET: to fetch tasks from a specific user 
app.get('/api/tasks/user', verifyToken, (req, res) => {
    const user_id = req.user.id; 
    const { f } = req.query; 

    let sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY enddate ASC';
    if (f == 1) { 
        sql = `SELECT * FROM tasks WHERE user_id = ? AND enddate >= CURDATE() AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY ) ORDER BY enddate ASC`;
    } else if (f == 2) {
        sql = `SELECT * FROM tasks WHERE user_id = ? AND enddate >= CURDATE() AND enddate <= DATE_ADD(CURDATE(), INTERVAL 31 DAY) ORDER BY enddate ASC`;
    } 
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
                  
//GET: Fetch all activites form a specific id                   
app.get('/api/activities/:task_id', verifyToken, (req, res) => {        
    const user_id = req.user.id;
    const task_id = req.params.task_id;

    const sql = `
        SELECT 
            tasks.id AS taskid, 
            tasks.description AS task_description,                                                          
            tasks.startdate,                                                                                          
            tasks.enddate,
            tasks.email AS task_email,
            activity.id AS activityid,
            activity.date,  
            activity.email AS activity_email,
            activity.description AS activity_description    
        FROM activity
        JOIN tasks ON activity.tasks_id = tasks.id
        WHERE tasks.user_id = ? AND tasks.id = ?
        ORDER BY activity.date 
    `;

    db.query(sql, [user_id, task_id], (err, results) => {
        if (err) {
            console.error('Error fetching activities:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No activities found for this task' });
        }

        const taskData = {
            taskid: task_id,
            description: results[0]?.task_description || null,
            startdate: results[0]?.startdate || null,
            enddate: results[0]?.enddate || null,
            email: results[0]?.task_email || null,
            activities: results.map(activity => ({
                activityid: activity.activityid,
                task_id: activity.taskid,
                email: activity.activity_email,
                description: activity.activity_description || null,
                date: activity.date
            }))
        };                                                              

        res.json(taskData);
    });
});

// POST: Add a new activity
app.post('/api/activities', verifyToken, (req, res) => {
    const { task_id, description } = req.body;
    const user_id = req.user.id;
    const email = req.user.email; 
    const date = new Date();      

    if (!task_id || !description) {
        return res.status(400).json({ error: 'Task ID and Description are required' });
    }

    const checkTaskQuery = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    db.query(checkTaskQuery, [task_id, user_id], (err, taskResults) => {
        if (err) {
            console.error('Error checking task:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (taskResults.length === 0) {
            return res.status(403).json({ error: 'Task not found or does not belong to the user' });
        }

        const insertActivityQuery = 'INSERT INTO activity (tasks_id, date, email, description) VALUES (?, NOW(), ?, ?)';
        db.query(insertActivityQuery, [task_id, email, description], (err, result) => {
            if (err) {
                console.error('Error inserting activity:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Activity added successfully', insertedId: result.insertId });
        });
    });
});

// POST: Assign task to a user using email instead of user ID
app.post('/api/tasks/:taskId/assign', verifyToken, (req, res) => {
    const { assigned_to_email } = req.body;
    const taskId = req.params.taskId;

    if (!assigned_to_email) {
        return res.status(400).json({ error: 'Assigned_to_email is required' });
    }

    // Check if the task exists
    const taskQuery = 'SELECT * FROM tasks WHERE id = ?';
    db.query(taskQuery, [taskId], (err, taskResults) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (taskResults.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if the assigned email exists in the users table
        const userQuery = 'SELECT email FROM users WHERE email = ?';
        db.query(userQuery, [assigned_to_email], (err, userResults) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (userResults.length === 0) {
                return res.status(404).json({ error: 'Assigned user not found' });
            }

            // Update the task with the assigned email
            const updateQuery = 'UPDATE tasks SET assigned_to_email = ? WHERE id = ?';
            db.query(updateQuery, [assigned_to_email, taskId], (err, result) => {
                if (err) {
                    console.error('Error updating task:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Task assigned successfully', assigned_to_email });
            });
        });
    });
});


// POST: Reassign an activity 
app.post('/api/reassign-activity', verifyToken, (req, res) => {  
    const { tasks_id, new_assigned_email } = req.body;

    if (!tasks_id || !new_assigned_email) {
        return res.status(400).json({ error: 'Task ID and new assigned email are required' });
    }

    // Check if the task exists
    const checkActivityQuery = 'SELECT id FROM activity WHERE id = ?'; 
    db.query(checkActivityQuery, [tasks_id], (err, activityResults) => {
        if (err) {
            console.error('Error checking activity:', err);                  
            return res.status(500).json({ error: 'Server error' });
        }

        if (activityResults.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });          
        }
        
        const updateAssignedQuery = 'UPDATE activity SET assigned_to = ? WHERE id = ?';
        db.query(updateAssignedQuery, [new_assigned_email, tasks_id], (err, result) => {
            if (err) {
                console.error('Error updating assigned user:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Activity reassigned successfully' });
        });
    });
});


app.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});   

