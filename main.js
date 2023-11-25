import conditions from './conditions.js';

(() => {
  const apiKey = "6aac58b4f39a49f58d4104157232311";
  const form = document.getElementById('form');
  const inputLatitude = document.getElementById('latitude');
  const inputLongitude = document.getElementById('longitude');
  const cardsContainer = document.getElementById('cards');
  const storageList = JSON.parse(localStorage.getItem('cardsList'));
  let cardsList = [];
  if (storageList != null && storageList.length > 0) {
    storageList.forEach(card => madeCard(card.latitude, card.longitude));
  }

  window.addEventListener('load', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        inputLatitude.placeholder = `${position.coords.latitude}`.substring(0, 7);
        inputLongitude.placeholder = `${position.coords.longitude}`.substring(0, 7);
      });
    }
  });

  form.onsubmit = function (e) {
    e.preventDefault();
    let latitude = inputLatitude.value.trim();
    let longitude = inputLongitude.value.trim();
    this.reset();
    madeCard(latitude, longitude);
  }

  async function madeCard(latitude, longitude) {
    const data = await getWeather(latitude, longitude);
    if (data.error) {
      showError(data.error.message);
    }
    else {
      const info = conditions.find(
        (obj) => obj.code === data.current.condition.code
      );
      const imgPath = "./IMG/" + (data.current.is_day ? info.day__text : info.night__text) + ".svg";
      const key = crypto.randomUUID();
      const weatherData = {
        city: data.location.name,
        country: data.location.country,
        temp: data.current.temp_c,
        condition: info.text,
        imgPath,
        latitude,
        longitude,
        key
      };
      cardsList.push({latitude, longitude, key});
      localStorage.setItem('cardsList', JSON.stringify(cardsList));
      showCard(weatherData);
    }
  }

  async function getWeather(latitude, longitude) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  function showCard({ key, city, country, temp, condition, imgPath, latitude, longitude }) {
    const html = `<div id="holder__${key}">
                    <div class="container card">
                      <div class="card__location">
                        <p class="card__city">${city}</p>
                        <p class="card__country">${country}</p>
                        <div class="card__coord">
                          <span>${latitude}</span>
                          <span>${longitude}</span>
                        </div>
                      </div>
                      <div class="card__weather">
                        <p class="card__value">${temp}<sup>°c</sup></p>
                      </div>
                      <p class="card__desc">${condition}</p>
                      <img class="card__img" src="${imgPath}" alt="Weather">
                      <button class="card__btn" id="${key}"><img src="../IMG/cross.svg" alt="Del"></button>
                    </div>
                  </div>`;
    cardsContainer.insertAdjacentHTML('afterbegin', html);
    addEventDelete(key)
  }

  function showError(errorMessage) {
    const key = crypto.randomUUID();
    const html = `<div class="holder__error" id="holder__${key}">
                    <div class="container card">
                      <p>${errorMessage}</p>
                      <button class="card__btn" id="${key}"><img src="../IMG/cross.svg" alt="Del"></button>
                    </div>
                  </div>`;
    cardsContainer.insertAdjacentHTML('afterbegin', html)
    addEventDelete(key);
  }

  function addEventDelete(key) {
    const button = document.getElementById(key);
    button.addEventListener('click', () => {
      const holder = document.getElementById(`holder__${key}`);
      holder.innerHTML = '';
      if(holder.className != "holder__error") {
        cardsList = cardsList.filter(card => card.key !== key);
        localStorage.setItem('cardsList', JSON.stringify(cardsList));
      }
    })
  }
})()



