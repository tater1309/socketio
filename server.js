var express = require("express"),
	app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());
    
var http = require("http"),
	server = http.Server(app);

var io = require("socket.io")(server);

// import the mongoose library
var mongoose = require("mongoose");

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

server.listen(3000);
console.log("The server is listening at port 3000");

//socket io
io.on('connection', function(socket){
	console.log("connection made");
	socket.on('new todo', function (data) {
		console.log(data);
		io.emit('test', { hello: 'world' });
	});
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

app.post("/todos", function (req, res) {

    console.log(req.body);

    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
    newToDo.save(function (err, result) {
	if (err !== null) {
	    // the element did not get saved!
	    console.log(err);
	    res.send("ERROR");
	} else {
	    // our client expects *all* of the todo items to be returned, so we'll do
	    // an additional request to maintain compatibility
	    ToDo.find({}, function (err, result) {
		if (err !== null) {
		    // the element did not get saved!
		    res.send("ERROR");
		}

		res.json(result);
	    });
	}
    });
});

