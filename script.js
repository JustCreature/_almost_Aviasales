const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = document.querySelector('.input__cities-from'),
  inputCitiesTo = document.querySelector('.input__cities-to'),
  dropdownCitiesFrom = document.querySelector('.dropdown__cities-from'),
  dropdownCitiesTo = document.querySelector('.dropdown__cities-to'),
  inputDateDepart = document.querySelector('.input__date-depart'),
  cheapestTicket = document.getElementById('cheapest-ticket'),
  otherCheapTickets = document.getElementById('other-cheap-tickets');

console.log(inputDateDepart);

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  citiesApiDownloaded = 'database/cities.json',
  API_KEY = 'ef7e8075f581391b1464f9bc1be3fee0',
  CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_COUNT = 10;

let city = [];
// let l = [];


const getData = (url, callback, reject = console.error) => {
  const request = new XMLHttpRequest();

  request.open('GET', url);
  
  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      
      console.error(request.status);
      reject(request.status);
    }
  });

  request.send();
};


const showCityFrom = (input, list) => {
  
  list.textContent = '';

  if (input.value !== '') {
    
    const filterCityTo = city.filter((item) => {
      // console.log(item.name);
      fixItem = item.name.toLowerCase();
      // return fixItem.includes(input.value.toLowerCase());
      // return fixItem.includes(input.value.toLowerCase()) && 
      // fixItem[0] === input.value.toLowerCase()[0];
      return fixItem.startsWith(input.value.toLowerCase());
      
    });
    

    filterCityTo.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__cities');
      li.textContent = item.name;
      list.append(li);
    });
  }
};

const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
    console.log(target.textContent);
  }
};

const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code);
  console.log(objCity);
  return objCity.name;
} ;

const getDate = (date) => {
  return new Date(date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getChanges = (num) => {
  if (num) {
    return num === 1 ? '1 change' : '2 changes';
  } else {
    return 'Without changes';
  }
};

const getLinkAviasales = (data) => {
  // https://www.aviasales.ru/search/SVX2905KGD1
  let link = 'https://www.aviasales.ru/search/';
  link += data.origin;

  const date = new Date(data.depart_date);

  const day = date.getDate();

  link += day < 10 ? '0' + day : day;

  const month = date.getMonth() + 1;

  link += month < 10 ? '0' + month : month;

  link += data.destination;

  link += '1';

  console.log(link);

  return link;
};

const createCard = (data) => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  let deep = '';

  if (data) {
    deep = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
        <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
          за ${data.value}₽</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Вылет из города
            <span class="city__name">${getNameCity(data.origin)}</span>
          </div>
          <div class="date">${getDate(data.depart_date)}</div>
        </div>

        <div class="block-right">
          <div class="changes">${getChanges(data.number_of_changes)}</div>
          <div class="city__to">Город назначения:
            <span class="city__name">${getNameCity(data.destination)}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    deep = '<h3>There are no tickets on this day!</h3>'
  }

  ticket.insertAdjacentHTML('afterbegin', deep)

  return ticket;
};

const renderCheapDay = (cheapTicket) => {
  cheapestTicket.style.display = 'block';
  cheapestTicket. innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
  

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
  console.log(ticket);
};

const renderCheapYear = (cheapTicket) => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets. innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';


  cheapTicket.sort((a, b) => {
    if (a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    return 0;
  });

  for (let i = 0; i < cheapTicket.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTicket[i]);
    otherCheapTickets.append(ticket);
  }

  console.log(cheapTicket);
};


const renderCheap = (data, date) => {
  const cheapTicketYear = JSON.parse(data).best_prices;
  console.log(cheapTicketYear);
  
  const cheapTicketDay = cheapTicketYear.filter((item) => {
    return item.depart_date === date;
  });
  console.log('cheapTicketDay ', cheapTicketDay);


  renderCheapDay(cheapTicketDay);
  renderCheapYear(cheapTicketYear);
};




inputCitiesTo.addEventListener('input', () => {
  showCityFrom(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesTo.addEventListener('click', (event) => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

inputCitiesFrom.addEventListener('input', () => {
  showCityFrom(inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesFrom.addEventListener('click', (event) => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

formSearch.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = {
    from: city.find(item => inputCitiesFrom.value === item.name),
    to: city.find(item => inputCitiesTo.value === item.name),
    when: inputDateDepart.value,
  };

  if (formData.from && formData.to) {

    const requestData = `?depart_date=${formData.when}&origin=${formData.from.code}` + 
    `&destination=${formData.to.code}&one_way=true&token=${API_KEY}`
    console.log(requestData);

    getData(proxy + CALENDAR + requestData, (response) => {
      renderCheap(response, formData.when);
    }, (error) => {
      alert('There are no flights for this direction');
      console.error('Error', error);
    });
  } else {
    alert('Enter correct city name');
  }
})


// with proxy
// getData(proxy + citiesApi, (data) => {
//   city = JSON.parse(data).filter(item => item.name);

// });

//without proxy
getData(citiesApiDownloaded, (data) => {
  city = JSON.parse(data).filter(item => item.name);
  
  city.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
  });
});

// getData(proxy + CALENDAR + 
//   '?depart_date=2020-05-29&origin=SVX&destination=KGD&one_way=true&token=' + 
//   API_KEY, (data) => {
//   const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date === '2020-05-29');
//   console.log(cheapTicket);

// });


