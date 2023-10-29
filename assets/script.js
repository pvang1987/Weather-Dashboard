// API key
const apiKey = '162bc14011890dbde578b12bdee3f248';

// HTML elements
var submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener('click', submitBtnEvent);
var userCity = document.getElementById("input");
let clearBtn = document.getElementById("clear-history");
clearBtn.addEventListener('click', clearHistory);

// event handler for the submit button
function submitBtnEvent(event) {
    event.preventDefault();
    var cityValue = userCity.value;

    // check if the city input is empty
    if (!cityValue) {
        alert('Please enter a city.');
        return;
    } else {
        // format city input to capitalize the first letter of each word
        cityValue = cityValue.toLowerCase();
        const formattedInput = cityValue.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        saveSearches(formattedInput);

        // populate and clear the search history
        populateSearchHistory();
        document.getElementById('input').value = null;
    }

    // call function to retrieve coordinates and weather data for the city
    searchCoordinatesApi(cityValue);
};

// event handler for the "Clear History" button
function clearHistory(event) {
    event.preventDefault();
    // remove city data from local storage and update the search history
    localStorage.removeItem('city');
    populateSearchHistory();
}

// function to save city searches to local storage
function saveSearches(formattedInput) {
    let localStorageData = JSON.parse(localStorage.getItem("city"));
    if (localStorageData === null) {
        localStorageData = [];
    }
    let filteredData = localStorageData.filter(data => data.toLowerCase() === formattedInput.toLowerCase());
    if (filteredData.length === 0) {
        localStorageData.push(formattedInput);
        localStorage.setItem("city", JSON.stringify(localStorageData));
    }
}


// function to fetch coordinates for a city using API
function searchCoordinatesApi(cityValue) {
    var coordinatesUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityValue + "&limit=1&appid=" + apiKey;

    fetch(coordinatesUrl)
        .then(response => response.json())
        .then(data => {
            // retrieve latitude and longitude and call the function to fetch weather data
            let lat = data[0].lat.toFixed(2);
            let lon = data[0].lon.toFixed(2);
            searchWeatherApi(lat, lon);
        })
        .catch(function (error) {
            // handle errors and display an alert message
            alert('Something went wrong. Please try again.');
            console.log(error);
        });
}

// function to fetch weather data for latitude and longitude
function searchWeatherApi(lat, lon) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey + "&units=imperial";

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            // display weather data and log the data to the console
            displayWeather(data);
            console.log(data);
        })
        .catch(function (error) {
            // handle errors and display an alert message
            alert('Something went wrong. Please try again.');
            console.log(error);
        });
}

// function to display weather data for the city
function displayWeather(data) {
    // retrieve the city name
    let cityName = data.city.name;
    document.getElementById("city-name").innerHTML = cityName;

    // clear existing weather data
    document.getElementById("current-weather").innerHTML = "";
    document.getElementById("five-day-forecast").innerHTML = "";

    for (var i = -1; i <= data.list.length; i += 8) {
        let index;
        if (i === -1) {
            index = i + 1;
        } else {
            index = i;
        }

        // create a Date object
        const date = new Date(data.list[index].dt * 1000);

        // define arrays for day names and month names
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // get the day, month, and year components of the date
        const day = dayNames[date.getUTCDay()];
        const month = monthNames[date.getUTCMonth()];
        const dayOfMonth = date.getUTCDate();
        const year = date.getUTCFullYear();

        // create the formatted date string
        const formattedDate = `${day}: ${month}. ${dayOfMonth}, ${year}`;

        // log the formatted date
        console.log(formattedDate); // Outputs: "Sun: Oct. 29, 2023"

        let temperature = Math.round(data.list[index].main.temp);
        let humidity = data.list[index].main.humidity;
        let windSpeed = data.list[index].wind.speed;

        if (i === -1) {
            // display current weather
            currentText = `
                <div>
                <img src="https://openweathermap.org/img/wn/${data.list[index].weather[0].icon}@2x.png" alt="weather icon">
                <p><b>${formattedDate}</b></p>
                <p><b> Temp:</b>&nbsp${temperature}&#176F</p>
                <p><b> Humidity:</b>&nbsp${humidity}%</p>
                <p><b> Wind:</b>&nbsp${windSpeed}mph</p>
                </div>
                `;
            document.getElementById("current-weather").innerHTML = currentText;
        } else {
            // display 5-day forecast
            resultsText = `
                <div class="forecast-results">
                <img src="https://openweathermap.org/img/wn/${data.list[index].weather[0].icon}@2x.png" alt="weather icon">
                <p><b>${formattedDate}</b></p>
                <p><b> Temp:</b>&nbsp${temperature}&#176F</p>
                <p><b> Humidity:</b>&nbsp${humidity}%</p>
                <p><b> Wind:</b>&nbsp${windSpeed}mph</p>
                </div>
                `;
            document.getElementById("five-day-forecast").innerHTML += resultsText;
        }
    }
}


// function to populate the search history
function populateSearchHistory() {
    let searchHistoryDiv = document.getElementById('search-history');
    searchHistoryDiv.innerHTML = "";

    let localStorageData = JSON.parse(localStorage.getItem('city'));
    if (localStorageData) {
        for (let i = 0; i < localStorageData.length; i++) {
            let historyBtn = document.createElement("button");
            historyBtn.innerHTML = localStorageData[i];
            historyBtn.className = "searched-cities-btn button is-dark";
            historyBtn.addEventListener("click", function (event) {
                event.preventDefault();
                let cityName = event.target.innerHTML;
                searchCoordinatesApi(cityName);
            });
            searchHistoryDiv.append(historyBtn);
        }
    }
}

// default city
window.onload = function () {
    populateSearchHistory(); // Populate the search history when the page loads
    cityValue = "Minneapolis";
    searchCoordinatesApi(cityValue);
};
