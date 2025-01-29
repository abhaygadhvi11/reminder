//import mysql from 'mysql2/promise';
var mysql      = require('mysql2');

function insertinformation(productname, email, startdate, enddate) {

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'abhay5678',
    database : 'project1'
  });
  
  //connection.connect();
  
  /*connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    });
    
    try {
      const [results, fields] = connection.query(
        'SELECT * FROM `information` WHERE `productname` = "abc"'
        );
        
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
        console.log('The solution is: ', results[0].solution);
        } catch (err) {
          console.log(err);
          }
          
          try {
            const [results] = connection.query(
              'SELECT * FROM `information` WHERE `productname` = "abc"'
              );
              
    console.log(results);
    } catch (err) {
      console.log(err);
      }
      */
     
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
    
// insertinformation('tst2', 'test2@exampl.ecom', '2024-01-02', '2025-01-02')

module.exports = {
  insertinformation
};
