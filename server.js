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
/*app.post('/api/tasks', verifyToken, (req, res) => {
    const { description, startdate, enddate, reminder } = req.body;
    const user_id = req.user.id;
    const user_email = req.user.email;

    if (!description || !startdate || !enddate) {
        return res.status(400).json({ error: 'Description, Start Date, and End Date are required' });
    }

    const assignedSequence = "1,2,3,4"; // Fixed sequence stored as text
    const initialAssignedUser = 1; // Always start with user 1

    // Calculate reminder date (15 days before `enddate`)
    let reminderDate = new Date(enddate);
    reminderDate.setDate(reminderDate.getDate() - 15);
    reminderDate = reminder ? reminderDate.toISOString().split("T")[0] : null;

    const sql = `
        INSERT INTO tasks 
        (description, email, startdate, enddate, reminder_date, user_id, assigned_sequence, assigned_to_user_id, current_index, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [description, user_email, startdate, enddate, reminderDate, user_id, assignedSequence, initialAssignedUser, 0, 'pending'], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Task added successfully',
            id: result.insertId,
            assigned_to: initialAssignedUser,
            reminder_date: reminderDate
        });
    });
});*/

// POST: Add a new task
app.post('/api/tasks', verifyToken, (req, res) => {
    const { description, startdate, enddate, reminder } = req.body;
    const user_id = req.user.id;
    const user_email = req.user.email;

    if (!description || !startdate || !enddate) {
        return res.status(400).json({ error: 'Description, Start Date, and End Date are required' });
    }

    const assignedSequence = "1,2,3,4"; // Fixed sequence stored as text
    const initialAssignedUser = 1; // Always start with user 1

    // Convert reminder to 0 or 1
    const reminderValue = reminder ? 1 : 0;

    // Calculate reminder date (15 days before `enddate`)
    let reminderDate = null;
    if (reminderValue === 1) {
        let tempReminderDate = new Date(enddate);
        tempReminderDate.setDate(tempReminderDate.getDate() - 15);
        reminderDate = tempReminderDate.toISOString().split("T")[0];
    }

    const sql = `
        INSERT INTO tasks 
        (description, email, startdate, enddate, reminder, reminder_date, user_id, assigned_sequence, assigned_to_user_id, current_index, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [description, user_email, startdate, enddate, reminderValue, reminderDate, user_id, assignedSequence, initialAssignedUser, 0, 'pending'], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'Task added successfully',
            id: result.insertId,
            assigned_to: initialAssignedUser,
            reminder: reminderValue,  // Return reminder as 0 or 1
            reminder_date: reminderDate
        });
    });
});


// POST: Mark a task as done
app.post('/api/tasks/:taskId/done', verifyToken, (req, res) => {
    const taskId = Number(req.params.taskId);
    const userId = req.user.id;

    if (isNaN(taskId)) {    
        return res.status(400).json({ error: 'Invalid Task ID' });
    }

    // Fetch task details
    db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let task = results[0];

        // Parse assigned sequence from text format
        let assignedSequence = task.assigned_sequence.split(',').map(Number);
        
        if (!Array.isArray(assignedSequence) || assignedSequence.length === 0) {
            console.error('Invalid assigned_sequence format:', task.assigned_sequence);
            return res.status(500).json({ error: 'Invalid assigned_sequence format' });
        }

        let currentIndex = Number(task.current_index) || 0;
        let completedBy = JSON.parse(task.completed_by || '[]');

        // Check if user has already marked it as done
        if (completedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already marked this task as done' });
        }

        // Add user to completed list
        completedBy.push(userId);
        const updatedCompletedBy = JSON.stringify(completedBy);

        if (currentIndex + 1 < assignedSequence.length) {
            // Move to the next user
            let nextUserId = assignedSequence[currentIndex + 1];

            db.query(
                'UPDATE tasks SET assigned_to_user_id = ?, current_index = ?, completed_by = ? WHERE id = ?',
                [nextUserId, currentIndex + 1, updatedCompletedBy, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: `Task reassigned to User ${nextUserId}` });
                }
            );
        } else {
            // If last user has completed, mark task as done
            db.query(
                'UPDATE tasks SET status = "done", completed_by = ? WHERE id = ?',
                [updatedCompletedBy, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task status:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: 'Task completed' });
                }
            );
        }
    });
});


 // POST: Mark a task as done
/*app.post('/api/tasks/:taskId/done', verifyToken, (req, res) => {
    const taskId = Number(req.params.taskId);
    const userId = req.user.id;

    if (isNaN(taskId)) {    
        return res.status(400).json({ error: 'Invalid Task ID' });
    }

    // Fetch task details
    db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let task = results[0];

        // Parse assigned sequence
        let assignedSequence;
        try {
            assignedSequence = JSON.parse(task.assigned_sequence);
            if (!Array.isArray(assignedSequence) || assignedSequence.length === 0) {
                throw new Error('assigned_sequence is not a valid array');
            }
        } catch (error) {
            console.error('Invalid assigned_sequence format:', error);
            return res.status(500).json({ error: 'Invalid assigned_sequence format' });
        }

        let currentIndex = Number(task.current_index) || 0;
        let completedBy = JSON.parse(task.completed_by || '[]');

        // Check if user has already marked it as done
        if (completedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already marked this task as done' });
        }

        // Add user to completed list
        completedBy.push(userId);
        const updatedCompletedBy = JSON.stringify(completedBy);

        if (currentIndex + 1 < assignedSequence.length) {
            // Move to the next user
            let nextUserId = Number(assignedSequence[currentIndex + 1]);

            db.query(
                'UPDATE tasks SET assigned_to_user_id = ?, current_index = ?, completed_by = ? WHERE id = ?',
                [nextUserId, currentIndex + 1, updatedCompletedBy, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: `Task reassigned to User ${nextUserId}` });
                }
            );
        } else {
            // If last user has completed, mark task as done
            db.query(
                'UPDATE tasks SET status = "done", completed_by = ? WHERE id = ?',
                [updatedCompletedBy, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task status:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: 'Task completed' });
                }
            );
        }
    });
});*/


// GET: Fetch tasks for a specific user (using user_id and email)
app.get('/api/tasks/user', verifyToken, (req, res) => {
    const user_id = req.user.id;  
    const user_email = req.user.email;         
    const { f } = req.query;           

    let sql = `
        SELECT * FROM tasks 
        WHERE user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ? 
        ORDER BY enddate ASC
    `;

    if (f == 1) { 
        sql = `
            SELECT * FROM tasks 
            WHERE (user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ?) 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
            ORDER BY enddate ASC
        `;
    } else if (f == 2) {
        sql = `
            SELECT * FROM tasks 
            WHERE (user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ?) 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 31 DAY) 
            ORDER BY enddate ASC
        `;
    }

    db.query(sql, [user_id, user_id, user_email], (err, results) => {    
        if (err) {  
            return res.status(500).json({ error: err.message });
        }                  
        if (results.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this user' });
        }
        res.json(results);  
    });
});

// GET: Fetch tasks created by the user
app.get('/api/tasks/created', verifyToken, (req, res) => {
    const user_id = req.user.id;
    const { f } = req.query; 

    let sql = `
        SELECT * FROM tasks 
        WHERE user_id = ? 
        ORDER BY enddate ASC
    `;

    if (f == 1) { 
        sql = `
            SELECT * FROM tasks 
            WHERE user_id = ? 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
            ORDER BY enddate ASC
        `;
    } else if (f == 2) {
        sql = `
            SELECT * FROM tasks 
            WHERE user_id = ? 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 31 DAY) 
            ORDER BY enddate ASC
        `;
    }

    db.query(sql, [user_id], (err, results) => {    
        if (err) {  
            return res.status(500).json({ error: err.message });
        }                  
        if (results.length === 0) {
            return res.status(404).json({ error: 'No tasks created by this user' });
        }
        res.json(results);  
    });
});

// GET: Fetch tasks assigned to the user
app.get('/api/tasks/assigned', verifyToken, (req, res) => {
    const user_id = req.user.id;
    const user_email = req.user.email;
    const { f } = req.query;  

    let sql = `
        SELECT * FROM tasks 
        WHERE assigned_to_user_id = ? OR assigned_to_email = ? 
        ORDER BY enddate ASC
    `;

    if (f == 1) { 
        sql = `
            SELECT * FROM tasks 
            WHERE (assigned_to_user_id = ? OR assigned_to_email = ?) 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) 
            ORDER BY enddate ASC
        `;
    } else if (f == 2) {
        sql = `
            SELECT * FROM tasks 
            WHERE (assigned_to_user_id = ? OR assigned_to_email = ?) 
            AND enddate >= CURDATE() 
            AND enddate <= DATE_ADD(CURDATE(), INTERVAL 31 DAY) 
            ORDER BY enddate ASC
        `;
    }

    db.query(sql, [user_id, user_email], (err, results) => {    
        if (err) {  
            return res.status(500).json({ error: err.message });
        }                  
        if (results.length === 0) {
            return res.status(404).json({ error: 'No tasks assigned to this user' });
        }
        res.json(results);  
    });
});

// GET: Fetch all activities for a specific task, including assigned tasks
app.get("/api/tasks/:task_id/activities", verifyToken, (req, res) => {
        const user_id = req.user.id;
        const task_id = req.params.task_id;
        const user_email = req.user.email;

        const sql = `
            SELECT 
                tasks.id AS taskid, 
                tasks.description AS task_description,                                                          
                tasks.startdate,                                                                                          
                tasks.enddate,
                tasks.email AS task_email,
                tasks.assigned_to_email AS task_assigned_to_email,
                tasks.assigned_to_user_id AS task_assigned_to_user_id,
                tasks.assigned_sequence, -- Stored as TEXT
                tasks.status AS task_status,
                activity.id AS activityid,
                activity.date,      
                activity.email AS activity_email,    
                activity.description AS activity_description    
            FROM activity
            JOIN tasks ON activity.tasks_id = tasks.id
            WHERE (
                tasks.user_id = ? 
                OR tasks.assigned_to_user_id = ?  
                OR FIND_IN_SET(?, tasks.assigned_sequence) > 0 
            ) 
            AND tasks.id = ?
            ORDER BY activity.date
        `;

        db.query(sql, [user_id, user_id, user_id, task_id], (err, results) => {
            if (err) {
                console.error("Error fetching activities:", err);
                return res.status(500).json({ error: "Server error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "No activities found for this task or user" });
            }

            const taskData = {
                taskid: task_id,
                description: results[0]?.task_description || null,
                startdate: results[0]?.startdate || null,
                enddate: results[0]?.enddate || null,
                email: results[0]?.task_email || null,
                assigned_to_email: results[0]?.task_assigned_to_email || null,
                assigned_to_user_id: results[0]?.task_assigned_to_user_id || null,
                task_status: results[0]?.task_status || null,
                assigned_sequence: results[0]?.assigned_sequence || "", 
                activities: results.map((activity) => ({
                    activityid: activity.activityid,
                    task_id: activity.taskid,
                    email: activity.activity_email,
                    description: activity.activity_description || null,
                    date: activity.date,
                })),
            };

            res.json(taskData);
        });
    });

// POST: Add a new activity
app.post("/api/activities", verifyToken, (req, res) => {
    const { task_id, description, date } = req.body;  // Accept date from request body
    const user_id = req.user.id;
    const email = req.user.email;
    const activityDate = date ? new Date(date) : new Date(); // Use provided date or default to server date
  
    if (!task_id || !description) {
      return res
        .status(400)
        .json({ error: "Task ID and Description are required" });
    }
  
    const checkTaskQuery = `SELECT * FROM tasks  
            WHERE id = ? AND (user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ?)`;
  
    db.query(
      checkTaskQuery,
      [task_id, user_id, user_id, email],
      (err, taskResults) => {
        if (err) {
          console.error("Error checking task:", err);
          return res.status(500).json({ error: "Server error" });
        }
  
        if (taskResults.length === 0) {
          return res.status(403).json({
            error: "Task not found or you are not authorized to add an activity",
          });
        }
  
        const insertActivityQuery =
          "INSERT INTO activity (tasks_id, date, email, description) VALUES (?, ?, ?, ?)";
        db.query(
          insertActivityQuery,
          [task_id, activityDate, email, description],
          (err, result) => {
            if (err) {
              console.error("Error inserting activity:", err);
              return res.status(500).json({ error: err.message });
            }
            res.json({
              message: "Activity added successfully",
              insertedId: result.insertId,
            });
          }
        );
      }
    );
  });

// POST: Assign task to a user using email and update assigned_to_user_id & assigned_to_email
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

        // Fetch user ID from email
        const userQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(userQuery, [assigned_to_email], (err, userResults) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (userResults.length === 0) {
                return res.status(404).json({ error: 'Assigned user not found' });
            }

            const assigned_to_user_id = userResults[0].id;

            // Update the task with both assigned_to_user_id and assigned_to_email
            const updateQuery = 'UPDATE tasks SET assigned_to_user_id = ?, assigned_to_email = ? WHERE id = ?';
            db.query(updateQuery, [assigned_to_user_id, assigned_to_email, taskId], (err, result) => {
                if (err) {
                    console.error('Error updating task:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ 
                    message: 'Task assigned successfully', 
                    assigned_to_user_id, 
                    assigned_to_email 
                });
            });
        });
    });
});

// POST: Mark a task as done
/*app.post('/api/tasks/:taskId/done', verifyToken, (req, res) => {
    const taskId = Number(req.params.taskId);
    const userId = req.user.id;

    if (isNaN(taskId)) {    
        return res.status(400).json({ error: 'Invalid Task ID' });
    }

    // Fetch task details
    db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let task = results[0];

        // Parse assigned sequence
        let assignedSequence;
        try {
            assignedSequence = JSON.parse(task.assigned_sequence);
            if (!Array.isArray(assignedSequence) || assignedSequence.length === 0) {
                throw new Error('assigned_sequence is not a valid array');
            }
        } catch (error) {
            console.error('Invalid assigned_sequence format:', error);
            return res.status(500).json({ error: 'Invalid assigned_sequence format' });
        }

        let currentIndex = Number(task.current_index) || 0;
        let completedBy = JSON.parse(task.completed_by || '[]');

        // Check if user has already marked it as done
        if (completedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already marked this task as done' });
        }

        // Add user to completed list
        completedBy.push(userId);
        const updatedCompletedBy = JSON.stringify(completedBy);

        let newStatus = task.status;

        // First user marks as done → update to "in progress"
        if (currentIndex === 0) {
            newStatus = "in progress";
        }

        if (currentIndex + 1 < assignedSequence.length) {
            // Move to the next user
            let nextUserId = Number(assignedSequence[currentIndex + 1]);

            db.query(
                'UPDATE tasks SET assigned_to_user_id = ?, current_index = ?, completed_by = ?, status = ? WHERE id = ?',
                [nextUserId, currentIndex + 1, updatedCompletedBy, newStatus, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: `Task reassigned to User ${nextUserId}`, status: newStatus });
                }
            );
        } else {
           
            newStatus = "done";

            db.query(
                'UPDATE tasks SET status = ?, completed_by = ? WHERE id = ?',
                [newStatus, updatedCompletedBy, taskId],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating task status:', updateErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    res.json({ message: 'Task completed', status: newStatus });
                }
            );
        }
    });
});*/

// PUT: marks the specific task for the reminder 
/*app.put("/tasks/:id/reminder", verifyToken,(req, res) => {
    const taskId = req.params.id;
    const { reminder } = req.body; // Expecting reminder: true or false
  
    const sql = "UPDATE tasks SET reminder = ? WHERE id = ?";
    db.query(sql, [reminder, taskId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Reminder updated successfully" });
    });
  });
  */
  
app.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});   

