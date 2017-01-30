var express  = require('express');
var app      = express();      
//var mongos=require("./formPart");                         // create our app w/ express
//var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var fs = require('fs');
var formidable = require("formidable");
var util = require('util');
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// configuration =================
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.post('/pushCsv',function(req,res) {
    var arrInitial=req.body.arr;
    var convertedArr=[];
    var insideArr=[];
    var fullArr=[];
    var finalString="";
    
    var lengthRow=arrInitial[0].length;
   
    function convert(full,start,len) {
        var innerArr=[];
        while(start<full.length){
            innerArr.push(full[start]);
            start=start+len;
        }
        convertedArr.push(innerArr);
    }

    for(var i=0;i<arrInitial.length;i++){
        fullArr=fullArr.concat(arrInitial[i]);
        
    }
    for(var k=0;k<lengthRow;k++){
        convert(fullArr,k,lengthRow);   
    }
    
    for(var initial=0;initial<convertedArr.length;initial++){
        var arrTaken=convertedArr[initial];
        finalString=finalString+arrTaken.join(",");
        finalString=finalString+"\n";
    }

    fs.writeFile('./finalData.csv', finalString, function(err) {
        if(err) {
            return console.log(err);
        }else{
            console.log("The file is saved at finalData.csv");
        }
    });
    res.json("data is successfully saved");
})

// listen (start app with node server.js) ======================================
app.listen(1186);
console.log("App listening on port 1186");
