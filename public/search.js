$('#search').on('keyup', function(){
    var term = $('#search').val();
    $.get('api/search/?event=' + term, function(data){
        $('.table_body').empty();
        if(data.length == 0){
            return $('.table_body').append("No matches!");
        }
        for (var i = 0; i < data.length; i++){
            var curr = data[i];
            var res = "<tr>" +
                "<th>" + curr.name + "</th>" +
                "<th>" + curr.location + "</th>" +
                "<th>" + curr.time + "</th>" +
                "<th>" + curr.notes + "</th>" +
                "<th>" + curr.attendees + "</th>" +
                "<th>" + '$' + curr.cost + "</th>" +
                "<th>" + "<a href=\"" + curr.pictures + "\"><img src=\"" + curr.pictures + "\" style=\"width:200px;height:150px\"/> </a> </th>"

            + "</tr>"
            $('.table_body').append(res);
        }

    })
})
