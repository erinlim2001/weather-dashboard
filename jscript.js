function getAPI()
{
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + userInput + '&units=imperial&appid=c0e9344b15e9fb8b405995a986ecd9d9')
        .then(function (response) {
            return response.json();
        })
        .then(function (data)
        {
            console.log(data)
            dayCity.text(data.name + " " +moment().format('MM/DD/YYYY'));
        })
    };
