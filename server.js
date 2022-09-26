const weather = require('weather-js');
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const axios = require('axios');

// Setup Server
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// get country flag API
async function getFlag(country) {
    const url = `https://restcountries.com/v3.1/name/${country}`;
    const response = await axios.get(url);
    const data = response.data;
    return data[0].flags.png;
}

// Get last word
function getLastWord(str) {
    const words = str.split(' ');
    return words[words.length - 1]
}

// Home page
app.get('/', function(req, res) {
    const SEARCH_LOCATION = 'Cebu City, PH';

    weather.find({search: SEARCH_LOCATION, degreeType: 'C'}, async (err, result) => {
        if(err || result.length < 1) {
            console.log(err);
            return;
        }

        const data = {}
        const info = result[0];
        const country = getLastWord(info.location.name);
        const imageBase = info.location.imagerelativeurl + 'law/'
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const long = info.location.long
        const lat = info.location.lat
        data.flag = await getFlag(country);
        data.location = info.location.name
        data.long = `${long >= 0 ? long : (long * -1)}° ${long >= 0 ? 'E' : 'W'}`
        data.lat = `${lat >= 0 ? lat : (lat * -1)}° ${lat >= 0 ? 'N' : 'S'}`
        data.forecast = []

        const curdate = new Date(info.current.date)
        data.forecast.push({
            img: `${imageBase}${info.current.skycode}.gif`,
            day: 'Today',
            date: `${month[curdate.getMonth()]}, ${curdate.getDate()} ${curdate.getFullYear()}`,
            temp: `${info.current.temperature}° C`,
            weather: info.current.skytext
        })

        info.forecast.forEach((f) => {
            const d = new Date(f.date)
            data.forecast.push({
                img: `${imageBase}${f.skycodeday}.gif`,
                day: f.day,
                date: `${month[d.getMonth()]}, ${d.getDate()} ${d.getFullYear()}`,
                temp: `${f.low}° C`,
                weather: f.skytextday
            })
        })
        
        return res.render('index', data);
    });
    
});

// Other page
app.get('/other', function(req, res) {
    res.render('other');
});

// static files
app.use(express.static(path.join(__dirname, 'public')));

// Listen to HTTP request
const PORT =  process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log('Listening on port ' + PORT);
});
