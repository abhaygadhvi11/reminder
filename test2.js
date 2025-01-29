const expess = require('express');
const app = expess();
const p = 3001;

const cors = require("cors");
app.use(cors());

var items = [
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
    
   
    ]

const listitems = () => {
    var items = [
       {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
       {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
       {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
       
      
       ]
       return items;
   }
   
   app.get('/api/tasks', (req, res) => {
    
       return res.json({details:items});
   });
   
   
   
   app.listen(p, () => {
       console.log(`Server is running on port ${p}`);
   });




