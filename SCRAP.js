//const express = require("express")
//import express from "express";
//const database = express();
//const database = require('./database.js');
//const app = express();
// app.use(cors({
//   origin: "*",
//   method: ["GET","POST"],
//   // allowedHeaders: ['Content-Type','Authorization']
// }));

//app.use(express.json())
// app.use(express.urlencoded({extended: false}))



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


 
// GET: Fetch all tasks for a specific user_id
/*app.get('/api/tasks/user/:user_id', verifyToken, (req, res) => {
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
});*/      

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


//token verification 
/*const verifyToken = (req, res, next) => {
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
};*/



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


/*const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));*/



//POST API TO ADD TASKS
/*app.post('/api/tasks', (req, res) => {
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
}); */ 


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


/*app.post('/api/tasks/:id/activities', (req, res) => {             
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
}); */  




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

app.get('/api/activities', verifyToken, (req, res) => {
    const user_id = req.user.id;

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
        WHERE tasks.user_id = ?
        ORDER BY activity.date 
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching activities:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No activities found for this user' });
        }

        const tasksObject = {};
        
        results.forEach(activity => {
            if (!tasksObject[activity.taskid]) {
                tasksObject[activity.taskid] = {
                    taskid: activity.taskid,
                    description: activity.task_description,
                    startdate: activity.startdate,
                    enddate: activity.enddate,
                    email: activity.task_email,
                    activities: []
                };
            }

            tasksObject[activity.taskid].activities.push({
                activityid: activity.activityid,
                task_id: activity.taskid,
                email: activity.activity_email,
                description: activity.activity_description || null,
                date: activity.date
            });
        });

        res.json(tasksObject);
    });
});

//GET: Fetch all activites form a specific id
/*app.get('/api/activities', verifyToken, (req, res) => {
    const user_id = req.user.id;

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
        WHERE tasks.user_id = ?
        ORDER BY activity.date 
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching activities:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No activities found for this user' });
        }

        const tasksObject = {};
        
        results.forEach(activity => {
            if (!tasksObject[activity.taskid]) {
                tasksObject[activity.taskid] = {
                    taskid: activity.taskid,
                    description: activity.task_description,
                    startdate: activity.startdate,
                    enddate: activity.enddate,
                    email: activity.task_email,
                    activities: []
                };
            }

            tasksObject[activity.taskid].activities.push({
                activityid: activity.activityid,
                task_id: activity.taskid,
                email: activity.activity_email,
                description: activity.activity_description || null,
                date: activity.date
            });
        });

        res.json(tasksObject);
    });
});*/


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

// POST: Add a new activity                                
app.post('/api/activities', verifyToken, (req, res) => {          

    const { task_id, date, email, description } = req.body;    
    const user_id = req.user.id; 

    if (!task_id || !date || !description) {
        return res.status(400).json({ error: 'Task ID, Date, and Description are required' });
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

        const insertActivityQuery = 'INSERT INTO activity (tasks_id, date, email, description) VALUES (?, ?, ?, ?)';
        db.query(insertActivityQuery, [task_id, date, email, description], (err, result) => {   
            if (err) {
                console.error('Error inserting activity:', err); 
                return res.status(500).json({ error: err.message });  
            }
            res.json({ message: 'Activity added successfully', insertedId: result.insertId });
        });
    });
});






//assign already created acivity 
app.post('/api/assign-activity', verifyToken, (req, res) => {
    const { activity_id, new_assigned_email } = req.body;
    const user_id = req.user.id;

    if (!activity_id || !new_assigned_email) {
        return res.status(400).json({ error: 'Activity ID and new assigned email are required' });
    }

    const checkActivityQuery = 'SELECT * FROM activity WHERE id = ?';
    db.query(checkActivityQuery, [activity_id], (err, activityResults) => {
        if (err) {
            console.error('Error checking activity:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (activityResults.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const task_id = activityResults[0].tasks_id;
        
        const checkTaskOwnershipQuery = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
        db.query(checkTaskOwnershipQuery, [task_id, user_id], (err, taskResults) => {
            if (err) {
                console.error('Error checking task ownership:', err);  
                return res.status(500).json({ error: 'Server error' });
            }

            if (taskResults.length === 0) {
                return res.status(403).json({ error: 'You do not have permission to reassign this activity' });
            }

            // Update the assigned email
            const updateActivityQuery = 'UPDATE activity SET email = ? WHERE id = ?';
            db.query(updateActivityQuery, [new_assigned_email, activity_id], (err, result) => {
                if (err) {
                    console.error('Error updating assigned activity:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Activity reassigned successfully' });
            });
        });
    });
});



// POST: Assign an activity 
app.post('/api/reassign-activity', verifyToken, (req, res) => {  
    const { tasks_id, new_assigned_email } = req.body;

    if (!tasks_id || !new_assigned_email) {
        return res.status(400).json({ error: 'tasks id and new assigned email are required' });
    }

    // Check if the activity exists
    const checkActivityQuery = 'SELECT * FROM activity WHERE id = ?'; 
    db.query(checkActivityQuery, [tasks_id], (err, activityResults) => {
        if (err) {
            console.error('Error checking activity:', err);                  
            return res.status(500).json({ error: 'Server error' });
        }

        if (activityResults.length === 0) {
            return res.status(404).json({ error: 'Activity not found' });          
        }

        // Update the assigned email
        const updateActivityQuery = 'UPDATE activity SET email = ? WHERE id = ?';
        db.query(updateActivityQuery, [new_assigned_email, tasks_id], (err, result) => {
            if (err) {
                console.error('Error updating assigned activity:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Activity reassigned successfully' });
        });
    });
});




//POST: assigning task to another user
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

        // Find the user_id of the assigned user
        const userQuery = 'SELECT id FROM users WHERE email = ?';
        db.query(userQuery, [assigned_to_email], (err, userResults) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (userResults.length === 0) {
                return res.status(404).json({ error: 'Assigned user not found' });
            }

            const assigned_to_id = userResults[0].id;

            // Update the task with the new assigned user
            const updateQuery = 'UPDATE tasks SET assigned_to = ? WHERE id = ?';
            db.query(updateQuery, [assigned_to_id, taskId], (err, result) => {
                if (err) {
                    console.error('Error updating task:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Task assigned successfully', taskId });
            });
        });
    });
});


/*app.get('/api/tasks/user', verifyToken, (req, res) => {
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
}); */



               //GET: Fetch all activites form a specific id                   
   /* app.get('/api/activities/:task_id', verifyToken, (req, res) => {        
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
                activity.id AS activityid,
                activity.date,      
                activity.email AS activity_email,
                activity.description AS activity_description    
            FROM activity
            JOIN tasks ON activity.tasks_id = tasks.id
            WHERE tasks.user_id = ? AND tasks.id = ? AND assigned_to_email = ?
            ORDER BY activity.date 
        `;

        db.query(sql, [user_id, task_id, user_email], (err, results) => {
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
                assigned_to_email: results[0]?.task_assigned_to_email || null,
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
    });*/



//GET: to fetch tasks from a specific user 
    app.get('/api/tasks/user', verifyToken, (req, res) => {
        const user_id = req.user.id; 
        const user_email = req.user.email; 
        const { f } = req.query; 
    
        let sql = `
            SELECT * FROM tasks 
            WHERE user_id = ? OR assigned_to_email = ? 
            ORDER BY enddate ASC
        `;
    
        if (f == 1) { 
            sql = `
                SELECT * FROM tasks 
                WHERE (user_id = ? OR assigned_to_email = ?) 
                AND enddate >= CURDATE() 
                AND enddate <= DATE_ADD(CURDATE(), INTERVAL 7 DAY ) 
                ORDER BY enddate ASC
            `;
        } else if (f == 2) {
            sql = `
                SELECT * FROM tasks 
                WHERE (user_id = ? OR assigned_to_email = ?) 
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
                return res.status(404).json({ error: 'No tasks found for this user' });
            }
            res.json(results);  
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


// POST: Reassign an activity 
/*app.post('/api/reassign-activity', verifyToken, (req, res) => {  
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
});*/ 


// GET: Fetch all activities for a specific task, including assigned tasks
/*app.get('/api/tasks/:task_id/activities', verifyToken, (req, res) => {
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
            activity.id AS activityid,
            activity.date,      
            activity.email AS activity_email,
            activity.description AS activity_description    
        FROM activity
        JOIN tasks ON activity.tasks_id = tasks.id
        WHERE (tasks.user_id = ? OR tasks.assigned_to_email = ?) 
        AND tasks.id = ?
        ORDER BY activity.date
    `;

    db.query(sql, [user_id, user_email, task_id], (err, results) => {
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
            assigned_to_email: results[0]?.task_assigned_to_email || null,
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
});*/


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
                activity.id AS activityid,
                activity.date,      
                activity.email AS activity_email,
                activity.description AS activity_description    
            FROM activity
            JOIN tasks ON activity.tasks_id = tasks.id
            WHERE (tasks.user_id = ? OR tasks.assigned_to_email = ?) 
            AND tasks.id = ?
            ORDER BY activity.date
        `;
  
    db.query(sql, [user_id, user_email, task_id], (err, results) => {
      if (err) {
        console.error("Error fetching activities:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "No activities found for this task" });
      }
  
      const taskData = {
        taskid: task_id,
        description: results[0]?.task_description || null,
        startdate: results[0]?.startdate || null,
        enddate: results[0]?.enddate || null,
        email: results[0]?.task_email || null,
        assigned_to_email: results[0]?.task_assigned_to_email || null,
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
    const { task_id, description } = req.body;
    const user_id = req.user.id;
    const email = req.user.email;
    const date = new Date();
  
    if (!task_id || !description) {
      return res
        .status(400)
        .json({ error: "Task ID and Description are required" });
    }
  
    const checkTaskQuery = `SELECT * FROM tasks  WHERE id = ? 
            AND (user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ?)`;
  
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
          "INSERT INTO activity (tasks_id, date, email, description) VALUES (?, NOW(), ?, ?)";
        db.query(
          insertActivityQuery,
          [task_id, email, description],
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


  // POST: Assign task to a user using email and directly update assigned_to_user_id in activity table
/*app.post('/api/tasks/:taskId/assign', verifyToken, (req, res) => {
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

        // Fetch assigned user ID using email
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

            // Update the task with assigned_to_user_id and assigned_to_email
            const updateTaskQuery = `
                UPDATE tasks 
                SET assigned_to_user_id = ?, assigned_to_email = ? 
                WHERE id = ?
            `;
            db.query(updateTaskQuery, [assigned_to_user_id, assigned_to_email, taskId], (err, result) => {
                if (err) {
                    console.error('Error updating task:', err);
                    return res.status(500).json({ error: err.message });
                }

                // Insert activity log and store assigned_to_user_id directly in activity table
                const insertActivityQuery = `
                    INSERT INTO activity (tasks_id, date, email, description, assigned_to_user_id) 
                    VALUES (?, NOW(), ?, ?, ?)
                `;
                const activityDescription = `Task assigned to ${assigned_to_email}`;
                
                db.query(insertActivityQuery, [taskId, assigned_to_email, activityDescription, assigned_to_user_id], (err, activityResult) => {
                    if (err) {
                        console.error('Error inserting activity:', err);
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        message: 'Task assigned successfully and activity logged',
                        assigned_to_user_id,
                        assigned_to_email,
                        activity_id: activityResult.insertId
                    });
                });
            });
        });
    });
});*/


// POST: Mark a task as done 
/*app.post('/api/tasks/:taskId/done', verifyToken, (req, res) => {
    const taskId = req.params.taskId;
    const userId = req.user.id; 
    const userEmail = req.user.email;

    const taskQuery = 'SELECT email, assigned_to_user_id, assigned_to_email, status FROM tasks WHERE id = ?';
    db.query(taskQuery, [taskId], (err, taskResults) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (taskResults.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = taskResults[0];

        if (task.email !== userEmail && task.assigned_to_user_id !== userId && task.assigned_to_email !== userEmail) {
            return res.status(403).json({ error: 'Only the creator or assigned user can mark this task as done' });
        }

        if (task.status === 'done') {
            return res.status(400).json({ error: 'Task is already marked as done' });
        }

    
        const updateQuery = 'UPDATE tasks SET status = ? WHERE id = ?';
        db.query(updateQuery, ['done', taskId], (err, result) => {
            if (err) {
                console.error('Error updating task status:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Task marked as done successfully' });
        });
    });
});*/


// POST: Mark a task as done 
/*app.post('/api/tasks/:taskId/done', verifyToken, (req, res) => {
    const taskId = Number(req.params.taskId); // Ensure taskId is a number

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid Task ID' });
    }

    db.query('SELECT * FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) {
            console.error('Error fetching task:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let task = results[0];
        //console.log('Raw assigned_sequence from DB:', task.assigned_sequence);

        // Ensure assigned_sequence is a valid JSON array
        let assignedSequence;
        try {
            assignedSequence = JSON.parse(task.assigned_sequence);
            console.log('Parsed assigned_sequence:', assignedSequence); 

            if (!Array.isArray(assignedSequence) || assignedSequence.length === 0) {
                throw new Error('assigned_sequence is not a valid array');
            }
        } catch (error) {
            console.error('Invalid assigned_sequence format:', error);
            return res.status(500).json({ error: 'Invalid assigned_sequence format' });
        }

        // Ensure current_index is a valid number
        let currentIndex = Number(task.current_index) || 0;
        console.log('Current index:', currentIndex); 

        if (currentIndex + 1 < assignedSequence.length) {
            // Move to next user
            let nextUserId = Number(assignedSequence[currentIndex + 1]);
            console.log(`Moving to next user: ${nextUserId}`); 

            db.query(
                'UPDATE tasks SET assigned_to_user_id = ?, current_index = ? WHERE id = ?',
                [nextUserId, currentIndex + 1, taskId],
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
            console.log('Task is now completed'); 

            db.query('UPDATE tasks SET status = "done" WHERE id = ?', [taskId], (updateErr) => {
                if (updateErr) {
                    console.error('Error updating task status:', updateErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ message: 'Task completed' });
            });
        }
    });
});*/


// GET: Fetch all activities for a specific task, including assigned tasks
/*app.get("/api/tasks/:task_id/activities", verifyToken, (req, res) => {
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
                tasks.status AS task_status,
                activity.id AS activityid,
                activity.date,      
                activity.email AS activity_email,    
                activity.description AS activity_description    
            FROM activity
            JOIN tasks ON activity.tasks_id = tasks.id
            WHERE (tasks.user_id = ? OR tasks.assigned_to_email = ?) 
            AND tasks.id = ?
            ORDER BY activity.date
        `;
  
    db.query(sql, [user_id, user_email, task_id], (err, results) => {
      if (err) {
        console.error("Error fetching activities:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "No activities found for this task or user" });      
      }
  
      const taskData = {
        taskid: task_id,
        description: results[0]?.task_description || null,
        startdate: results[0]?.startdate || null,
        enddate: results[0]?.enddate || null,
        email: results[0]?.task_email || null,
        task_status: results[0]?.task_status || null,
        assigned_to_email: results[0]?.task_assigned_to_email || null,
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
*/


// POST: Add a new task
/*app.post('/api/tasks', verifyToken, (req, res) => {
    const { description, startdate, enddate } = req.body;  
    const user_id = req.user.id;  
    const user_email = req.user.email; 

    if (!description || !startdate || !enddate) {
        return res.status(400).json({ error: 'Description, Start Date, and End Date are required' });
    }

    const sql = 'INSERT INTO tasks (description, email, startdate, enddate, user_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [description, user_email, startdate, enddate, user_id], (err, result) => { 
        if (err) {
            console.error('Error inserting data:', err);   
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});*/

// POST: Add a new task
/*app.post('/api/tasks', verifyToken, (req, res) => {
    const { description, startdate, enddate, assigned_users } = req.body;  
    const user_id = req.user.id;  
    const user_email = req.user.email; 

    if (!description || !startdate || !enddate || !Array.isArray(assigned_users) || assigned_users.length === 0) {
        return res.status(400).json({ error: 'Description, Start Date, End Date, and Assigned Users are required' });
    }

    const assignedSequence = JSON.stringify(assigned_users);
    //console.log("Assigned Sequence before insertion:", assignedSequence); // Debugging

    const firstAssignedUser = assigned_users[0];

    const sql = 'INSERT INTO tasks (description, email, startdate, enddate, user_id, assigned_sequence, assigned_to_user_id, current_index, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [description, user_email, startdate, enddate, user_id, assignedSequence, firstAssignedUser, 0, 'pending'], (err, result) => { 
        if (err) {
            console.error('Error inserting data:', err);   
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});*/

// POST: Add a new activity
/*app.post("/api/activities", verifyToken, (req, res) => {
    const { task_id, description } = req.body;
    const user_id = req.user.id;
    const email = req.user.email;
    const date = new Date();
  
    if (!task_id || !description) {
      return res
        .status(400)
        .json({ error: "Task ID and Description are required" });
    }
  
    const checkTaskQuery = `SELECT * FROM tasks  WHERE id = ? 
            AND (user_id = ? OR assigned_to_user_id = ? OR assigned_to_email = ?)`;
  
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
          "INSERT INTO activity (tasks_id, date, email, description) VALUES (?, NOW(), ?, ?)";
        db.query(
          insertActivityQuery,
          [task_id, email, description],
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
  });*/



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


