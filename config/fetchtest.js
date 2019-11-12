const fetch = require("node-fetch");

fetch('./tags.json')
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })
    .catch(err => console.error(err));