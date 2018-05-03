var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var moment = require('moment');
var multer = require('multer');
var fs = require('fs');
var filter = require('./public/filter.js');

dotenv.load();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use('/public', express.static('public'));
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

var Event = require('./models/Event');
var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "public/images");
    },
    filename: function(req, file, callback) {
        callback(null, req.body.name + "_" + Date.now() + "_" + file.originalname);
    }
});
var upload = multer({
    storage: Storage
}).array("imgUploader", 100);

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    Event.find({}, function(err, events) {
        return res.render('events', {
            events: events
        });
    });

});


app.get('/test', function(req, res) {
    var count = 0;
    Event.count({}, function(err, count) {
        console.log(count);
    });
})

app.get('/addEvent', function(req, res) {
    res.render('addEvent', {
        active: {
            add: true
        }
    })
});


app.post('/addEvent', function(req, res) {
    upload(req, res, function(err) {
        //console.log(req.files);
        if (err) return res.send(err);
        var name = req.body.name;
        var location = req.body.location;
        var time = req.body.time
        var note = req.body.note;
        var cost = req.body.cost;
        var attendees = req.body.attendees.split(",").map(function(curr) {
            return curr.trim();
        });
        if (typeof req.files[0] !== 'undefined') {
            var pictures = req.files[0].path;
            var event = new Event({
                name: name,
                location: location,
                pictures: pictures,
                time: time,
                notes: note,
                attendees: attendees,
                cost: cost
            });
        } else {
            var event = new Event({
                name: name,
                location: location,
                time: time,
                notes: note,
                attendees: attendees,
                cost: cost
            });
        }

        event.save(function(error) {
            if (error) throw error;
            io.emit('new event', event);
            return res.render('addEvent', {
                added: '1',

            });
        });
    });

});

app.get('/api/view', function(req, res) {
    Event.find({}, function(err, events) {
        return res.json(events);
    })
});


app.get('/api/search', function(req, res) {
    var search_query = req.query.event;
    Event.find({
        "name": {
            "$regex": search_query,
            '$options': 'i'
        }
    }, function(err, events) {
        return res.json(events);
    });
});

app.get('/filters', function(req, res) {
    var filter = req.query.filter;
    console.log(filter);
    var result;
    if (filter == 'free') {
        Event.find({
            'cost': 0
        }, function(err, events) {
            return res.render('events', {
                events: events,
                active: {
                    free: true
                }
            });
        });
    }
    if (filter == 'popular') {
        Event.aggregate(
            [{
                    "$project": {
                        "cost": 1,
                        "name": 1,
                        "location": 1,
                        "time": 1,
                        "pictures": 1,
                        "notes": 1,
                        "attendees": 1,
                        "length": {
                            "$size": "$attendees"
                        }
                    }
                },
                {
                    "$sort": {
                        "length": -1
                    }
                },
            ],
            function(err, events) {
                res.render('events', {
                    events: events,
                    active: {
                        popular: true
                    }
                });
            }
        )
    }
    if (filter == 'likes') {
        var likes = req.query.like;
        var query = "";
        if (Array.isArray(likes)) {
            for (var i = 0; i < likes.length; i++) {
                query = query + likes[i] + "|";
            }
            query = query.substring(0, query.length - 1);
        } else {
            query = likes;
        }
        console.log(query);
        Event.find({
                '$or': [{
                        'notes': {
                            '$regex': query,
                            '$options': 'i'
                        }
                    },
                    {
                        'name': {
                            '$regex': query,
                            '$options': 'i'
                        }
                    },
                    {
                        'location': {
                            '$regex': query,
                            '$options': 'i'
                        }
                    }
                ]
            },
            function(err, results) {
                console.log(results);
                res.render('events', {
                    events: results,
                    active: {
                        like: true
                    }
                })
            });
    }
    if (filter == 'time') {

        var month = req.query.month;
        Event.find({
                'time': {
                    '$regex': month,
                    '$options': 'i'
                }
            },
            function(err, events) {
                console.log(err);
                res.render('events', {
                    events: events,
                    active: {
                        time: true
                    }
                });
            });
    }
    if (filter == 'random') {
        Event.count().exec(function(err, count) {

            var random = Math.floor(Math.random() * count);

            Event.findOne().skip(random).exec(
                function(err, result) {
                    res.render('events', {
                        events: result,
                        active: {
                            random: true
                        }
                    })

                });

        });

    }
});

app.get('/viewMap', function(req, res) {
    Event.find({}, function(err, events) {
        res.render('viewMap', {
            events: events,
            active: {
                map: true
            }
        });


    });
});



// app.post('/addEvent2', function(req, res) {
//     upload(req, res, function(err) {
//         if (err) return ("Wrong");
//         var k = req.files[0].filename;
//         console.log(k);
//         return res.send(req.body);
//     })
// });

app.post('/api/addEvent', function(req, res) {
    var name = req.body.name;
    var location = req.body.location;
    var note = req.body.note;
    var time = req.body.time;
    var attendees = req.body.attendees.split(",").map(function(curr) {
        return curr.trim();
    });
    var picture = req.body.picture;
    var cost = req.body.cost;

    var event = new Event({
        name: name,
        location: location,
        time: time,
        notes: note,
        attendees: attendees,
        pictures: picture,
        cost: cost,
    });

    event.save(function(error) {
        if (error) throw error;
        io.emit('new event', event);
        return res.render('addEvent', {
            added: '1',
        });
    });


});

io.on('connection', function(socket) {
    socket.on('new event', function(msg) {
        io.emit('new event', msg);
    });
});

http.listen(process.env.PORT || 3000, function() {
    console.log('Example app listening on port 3000!');
});
