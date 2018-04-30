function getFilter(filter, Event){
    Event.find({}, function(err, events){
        return events;
    });
}





module.exports = {
    getFilter: getFilter,
}
