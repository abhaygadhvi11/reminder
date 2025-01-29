const e = require('express');
const a = e();
const p = 4000;

var mysql = require('mysql');


function insertinformation(productname, email, startdate, enddate) {



//const cors = require("cors");
//app.use(cors());


/*const listitems = () => {
 var items = [
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
    {"Productname": "renewal of ac", startdate: "2021-01-01", enddate: "2021-12-31","email": "test@abc.com"},
   ]
    return items;
}*/


connection.connect(function(err) 
     {
       if (err) throw err;
       console.log("Connected!");  
       var sql = "INSERT INTO information (productname, email, startdate, enddate) VALUES( ?, ?, ?, ?);"

       // var sql = `INSERT INTO information (productname, email, startdate, enddate) VALUES ('${productname}', '${email}', '${startdate}', '${enddate}')`
       connection.query(sql, [productname, email, startdate, enddate], function (err, result) 
       {
         if (err) throw err;
         console.log("1 record inserted");
         connection.end();   
        });   
      });
      
    }


    module.exports = {
        insertinformation
      };
      

/*a.get('/api/tasks', (req, res) => {
    let data = listitems();
    res.send(data);
});
*/

a.listen(p, () => {
    console.log(`Server is running on port ${p}`);
});

