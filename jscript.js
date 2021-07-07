var city = "";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWindSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var storedCity = [];

// checks if the cityName is already searched and stored
function findCity(cityName) {
    for (var i=0; i<storedCity.length; i++){
        if (cityName.toUpperCase() === storedCity[i]) {
            return true;  // cityName already searched/stored previously
        }
    }
    return false;   // cityName not searched/stored previsously
}

// openweathermap.org API key
var APIKey = "c0e9344b15e9fb8b405995a986ecd9d9";

// for current and future weather information
function displayWeather(event) {
    event.preventDefault();
    city = searchCity.val().trim();
    if (city !== "") {       
        currentWeather(city);
    }
}

// openweathermap.org API call by city name
function currentWeather(city){
    // temperature unit: Default-Kelvin, Metric-Celisus, Imperial-Farenheit
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + APIKey;
    
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(response) {
        // current weather information including city name, date and weather icon. 
        console.log(response);
        var weatherIcon = response.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/w/" + weatherIcon + ".png"; 

        // date format method from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt*1000).toLocaleDateString();

        // name of city and concanating the date and icon
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconURL + ">");

        // current temperature in Farenheit
        $(currentTemperature).html((response.main.temp)+"&#8457");

        // current humidity in %
        $(currentHumidty).html(response.main.humidity + "%");

        // current wind speed in mile/hour
        $(currentWindSpeed).html(response.wind.speed + "MPH");

        // UVIndex by longitude and latitude
        UVIndex(response.coord.lon, response.coord.lat);

        forecast(response.id);
        if (response.cod == 200) {
            storedCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(storedCity);
            if (storedCity == null) {
                storedCity = [];
                storedCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(storedCity));
                addToList(city);
            } else if (findCity(city) == false ) {  // if city not in storedCity (not searched/stored previously)
                    storedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(storedCity));
                    addToList(city);
            }
        }

    });
}
    
// returns the UVIindex by longitude and latitude
function UVIndex(ln, lt) {
    // deprecated on 1st Apr. 2021. Need to use One Call API
    var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
            url: uvIndexURL,
            method: "GET"
            }).then(function(response) {
                $(currentUvindex).html(response.value);
            });
}
    
// 5 day forecast for current city
function forecast(cityid) {
    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&units=imperial&appid="+APIKey;
    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function(response) {      
        console.log(response);
        for (var i=0; i<5; i++) {
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconCode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/" + iconCode + ".png";
            var tempF = response.list[((i+1)*8)-1].main.temp;
            var humidity = response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconURL+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }        
    });
}

// add the searched city to search history
function addToList(city){
    var listEl = $("<li>" + city.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", city.toUpperCase());
    $(".list-group").append(listEl);
}

// city name from search history and call API for current weather information
function invokePastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
}

// get city name search last from history and call API for current weather information
function loadLastCity(){
    $("ul").empty();
    var storedCity = JSON.parse(localStorage.getItem("cityname"));
    if (storedCity !== null) {
        for(var i=0; i<storedCity.length; i++) {
            addToList(storedCity[i]);
        }
        city = storedCity[i-1];
        currentWeather(city);
    }

}

// Click event handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", invokePastSearch);
$(window).on("load", loadLastCity);
//localStorage.removeItem("cityname");  // reset for startover