# MyEvents
---

URL: https://blooming-brushlands-91791.herokuapp.com/

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`:     name           `Type: String`
- `Field 2`:     location       `Type: String`
- `Field 3`:     time           `Type: String`
- `Field 4`:     pictures       `Type: [String]`
- `Field 5`:     notes          `Type: String`
- `Field 6`:     attendees      `Type: [String]`
- `Field 6`:     cost           `Type: Number`


Schema:

{
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

}



### 2. Add New Data

HTML form route: `/addEvent`

POST endpoint route: `/api/addEvent`

Example Node.js POST request to endpoint:
```javascript
var request = require("request");

var options = {
    method: 'POST',
    url: 'http://localhost:3000/api/addEvent',
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
        name: 'Free Cupcakes'
        location: '8150 Leesburg Pike, Vienna, Va, USA',
        time: 'Sat Apr 14 2018'
        note: 'Come take some free cupcakes!',
        attendees: 'benny cheng,john smith,kevin bar',
        picture:  'http://www.cupcakebydesign.com/images/products/530/BirthdayCake.jpg',
        cost:2
    }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/view`

### 4. Search Data

Search Field: name

### 5. Navigation Pages

Navigation Filters
1. Free -> `  /filters?filter=free  `
2. Popular -> `  /filters?filter=popular  `
3. Like... -> `  /filters?filter=like  `
4. Time -> `  /filters?filter=time  `
5. Random -> `  /filters?filter=random  `
6. Map -> `   /viewMap      `
7. Create New Event ->  `/addEvent `


