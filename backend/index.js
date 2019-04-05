//import the require dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
app.set('view engine', 'ejs');
var mysql      = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'express_test',
    debug    :  false
});

//use cors to allow cross origin resource sharing
app.use(cors({ origin: 'ec2-18-144-67-144.us-west-1.compute.amazonaws.com', credentials: true }));

//use express session to maintain session data
app.use(session({
    secret              : 'cmpe273_kafka_passport_mongo',
    resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration      :  5 * 60 * 1000
}));

// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(bodyParser.json());

//Allow Access Control
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'ec2-18-144-67-144.us-west-1.compute.amazonaws.com');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

  var Users = [{
      username : "admin",
      password : "admin"
  }]

  var books = [
    {"BookID" : "1", "Title" : "Book 1", "Author" : "Author 1"},
    {"BookID" : "2", "Title" : "Book 2", "Author" : "Author 2"},
    {"BookID" : "3", "Title" : "Book 3", "Author" : "Author 3"}
]

//Route to handle Post Request Call
app.post('/login',function(req,res){
    
    // Object.keys(req.body).forEach(function(key){
    //     req.body = JSON.parse(key);
    // });
    // var username = req.body.username;
    // var password = req.body.password;
    console.log("Inside Login Post Request");
    //console.log("Req Body : ", username + "password : ",password);
    console.log("Req Body : ",req.body);
    Users.filter(function(user){
        if(user.username === req.body.username && user.password === req.body.password){
            res.cookie('cookie',"admin",{maxAge: 900000, httpOnly: false, path : '/'});
            req.session.user = user;
            res.writeHead(200,{
                'Content-Type' : 'text/plain'
            })
            res.end("Successful Login");
        }
    })

    
});

//Route to get All Books when user visits the Home Page
app.get('/home', function(req,res){
    console.log("Inside Home Login");    
    res.writeHead(200,{
        'Content-Type' : 'application/json'
    });
    console.log("Books : ",JSON.stringify(books));
    res.end(JSON.stringify(books));
    
})
//start your server on port 3001
app.listen(3001);
console.log("Server Listening on port 3001");


function handle_database(req,res) {
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        res.json({"connected to Mysql db as id" : connection.threadId});
        console.log("connected to Mysql db as id")
        console.log(connection.threadId);
        connection.release();
 });

}

app.get("/",function(req,res){-
        handle_database(req,res);
});






app.get("/withoutpool",function(req,res){
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'express_test'
      });
      
      
      connection.connect(function(err){
      if(!err) {
          console.log("Database is connected ... nn");    
      } else {
          console.log("Error connecting database ... nn");    
      }
      });
    console.log("withoutpool")
    connection.query('SELECT * from books LIMIT 2', function(err, rows, fields) {
    connection.end();
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.');
    res.end(JSON.stringify(rows));
  });
});



app.get("/mysqlbook", function(req,res){
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }  
        connection.query('SELECT * from books', function(err, rows, fields){
            connection.release();

            console.log("Inside Mysql Books");    
            res.writeHead(200,{
            'Content-Type' : 'application/json'
             });
            console.log("Books : ",JSON.stringify(books));
            if(!err) {
            res.end(JSON.stringify(rows));
  
            }
                //console.log('The solution is: ', rows);
                       
        });
    });
});




//Route to handle create Post Request Call
app.put('/create',function(req,res){
    
   
    console.log("Inside Create Post Request");
    
    console.log("Req Body : ",req.body);


    console.log("Session Data : ", req.session.user);

    


    if(books.filter(function(book){
        return book.BookID == req.body.bookid;
        }).length == 0){
            console.log("BookID Does not Exist, Creating new Book ID");
            var new_book = {"BookID" : req.body.bookid, "Title" : req.body.title, "Author" : req.body.author};
            books.push(new_book);

            res.writeHead(200,{
                'Content-Type' : 'text/plain'
            })
            res.end("Successful written");
    }
    else{
        console.log("Duplicate BookID provided");
        res.writeHead(202,{
                'Content-Type' : 'text/plain'
            })
            res.end("Book ID is Duplicate. Update is not Successful");
    }



  

    
});

//Route to handle create Post Request Call
app.delete('/delete',function(req,res){
    
   
    console.log("Inside Delete Delete Request");
    
    console.log("Req Body : ",req.body);


    console.log("Session Data : ", req.session.user);

    


    book_new = books.filter(function(book){
            return book.BookID !== req.body.bookid;
            });
    if(JSON.stringify(book_new)===JSON.stringify(books)){
        
    res.writeHead(202,{
                'Content-Type' : 'text/plain'
            })
            res.end("Book Not Found");
    }
    else{
        books = book_new;
        res.writeHead(200,{
                'Content-Type' : 'text/plain'
            })
            res.end("Book Deletion Successful");
    }

    
});

app.delete('/mysqldelete',function(req,res){
    
   
    console.log("Inside Mysql Delete Request");
    
    console.log("Req Body : ",req.body);


    console.log("Session Data : ", req.session.user);

    


    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }  
        var sql = mysql.format("delete from books where BookId=?", [req.body.bookid]);
        connection.query(sql, function(err, result){
            connection.release();

            console.log("Number of records deleted: " + result.affectedRows);    
            res.writeHead(200,{
            'Content-Type' : 'application/json'
             });
            
            if(!err) {
            res.end("Number of records deleted: " + result.affectedRows);
  
            }
                //console.log('The solution is: ', rows);
                       
        });
    });

    
});


app.put('/mysqlinsert',function(req,res){
    
   
    console.log("Inside Mysql Insert Request");
    
    console.log("Req Body : ",req.body);


    console.log("Session Data : ", req.session.user);

    


    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }  
        //var b =1;
        //var a ="a";
        //var t = "8";
         
         //var sql = mysql.format("INSERT INTO books (BookId, Author, Title) VALUES ("+b+",'"+a+"',"+t+")");
         var sql = mysql.format("INSERT INTO books (BookId, Author, Title) VALUES ("+req.body.bookid+",'"+req.body.author+"','"+req.body.title+"')");
        
        
            

         
            connection.query(sql, function(err){
            connection.release();

               
            res.writeHead(200,{
            'Content-Type' : 'application/json'
             });
            
            if(!err) {
            res.end("Book was created");
            console.log("Book was created"); 

  
            }
            else{
                console.log(err);
                res.writeHead(200,{
            'Content-Type' : 'application/json'
             });
                res.end("Book was created");
            }
                //console.log('The solution is: ', rows);
            
                       
        });

            
    });

    
});


//Calculator Application

//Route to handle create Post Request Call
app.post('/Calculator',function(req,res){
    
   
    console.log("Inside Calculator");
    
    console.log("Req Body : ",req.body); 
    var result;  


    if(req.body.operation === '+'){
        console.log("inside +");
        result = (parseFloat(req.body.first) + parseFloat(req.body.second));
    }
    else if(req.body.operation === '-'){
        console.log("inside -");
        result = (parseFloat(req.body.first) - parseFloat(req.body.second));
    }

    else if(req.body.operation === '*'){
        console.log("inside *");
        result = (parseFloat(req.body.first) * parseFloat(req.body.second));
    }

    else if(req.body.operation === '/'){
        console.log("inside /");
        result = (parseFloat(req.body.first) / parseFloat(req.body.second));
    }
    
                res.writeHead(200,{
            'Content-Type' : 'application/json'
             });
                
                result = "Result is : " +result;
                console.log(result);
                res.end(result);


});


