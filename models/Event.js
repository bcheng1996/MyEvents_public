var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    cost:{
        type: Number,
        default: 0
    },
    name: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    pictures: {
        type: [String],
        default: ['public/images/not-available.jpg']
    },
    notes: {
        type: String,
        required: true
    },
    attendees: {
        type: [String]
    }

});



var Event = mongoose.model('Event', eventSchema);
module.exports = Event;
