'use strict'

//  ------ DOM elements to work with ----------
// menu
const leftMenu = document.querySelector('.left-menu')
const hamburger = document.querySelector('.hamburger')
const dropdown = document.querySelectorAll('.dropdown')
//  ul with a list of cards
const showsList = document.querySelector('.tv-shows__list')
// loader
const tvShow = document.querySelector('.tv-shows')
// modal window
const modal = document.querySelector('.modal')
const tvCardImg = document.querySelector('.tv-card__img')
const modalTitle = document.querySelector('.modal__title')
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const description = document.querySelector('.description')
const modalLink = document.querySelector('.modal__link')
const preloader = document.querySelector('.preloader')
const posterWrapper = document.querySelector('.poster__wrapper')
const modalContent = document.querySelector('.modal__content')
//  search form
const searchForm = document.querySelector('.search__form')
const searchFormInput = document.querySelector('.search__form-input')
// to display messages
const tvShowsHead = document.querySelector('.tv-shows__head')
// pagination
const pagination = document.querySelector('.pagination')

//  Loder
const loading = document.createElement('div')
loading.classList = 'loading'


// URL for source of pictures (posters)
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2'
const DEFAULT_IMG = 'img/no-poster.jpg'
const SERVER = 'https://api.themoviedb.org/3'

// get the API key from the local file

let API_KEY

async function getAPIKey() {
    const response = await fetch('private/api-key.txt');
    API_KEY = await response.text();
}

// API key is written to the apiKey variable
getAPIKey()


//  create DBServise class

class DBService {
    async getData(url) {
        const response = await fetch(url);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`);
        }
    }

    getTestData() {
        return this.getData('test.json')
    }

    getTestCard() {
        return this.getData('card.json')
    }

    getSearchResult(query) {
        this.url = `${SERVER}/search/tv/?api_key=${API_KEY}&language=ru-RU&query=${query}`
        return this.getData(this.url)
    }

    getNextPage(page) {
        const url = `${this.url}&page=${page}`
        return this.getData(url)
    }

    getTvShow(id) {
        this.url = `${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`
        return this.getData(this.url)
    }

    getTopRated() {
        this.url = `${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`
        tvShow.append(loading)
        return this.getData(this.url)
    }

    getPopular() {
        this.url = `${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`
        tvShow.append(loading)
        return this.getData(this.url)
    }
    getToday() {
        this.url = `${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`
        tvShow.append(loading)
        return this.getData(this.url)
    }
    getWeek() {
        this.url = `${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`
        tvShow.append(loading)
        return this.getData(this.url)
    }

}

const dbservice = new DBService

//  Side menu interaction

const closeDropdown = () => {
    dropdown.forEach(i => i.classList.remove('active'))

}

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu')
    hamburger.classList.toggle('open')
    closeDropdown()
})

document.body.addEventListener('click', ({ target }) => {
    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu')
        hamburger.classList.remove('open')
        // closeDropdown()
    }
})

leftMenu.addEventListener('click', event => {
    event.preventDefault()
    const target = event.target
    const dropdown = target.closest('.dropdown')

    if (dropdown) {
        dropdown.classList.toggle('active')
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')
    }

    if (target.closest('#top-rated')) {
        dbservice.getTopRated().then(res => renderCards(res, target))
    }
    if (target.closest('#popular')) {
        dbservice.getPopular().then(res => renderCards(res, target))
    }
    if (target.closest('#today')) {
        dbservice.getToday().then(res => renderCards(res, target))
    }
    if (target.closest('#week')) {
        dbservice.getWeek().then(res => renderCards(res, target))
    }
    if (target.closest('#search')) {
        showsList.textContent = ''
        tvShowsHead.textContent = 'Вам нужно ввести поисковый запрос в поле Поиск•'
    }



})

//  Interaction with promotional pictures of films

const eventHandler = ({ target }) => {
    const tvCard = target.closest('.tv-card')
    if (!tvCard) {
        return
    }
    const image = tvCard.querySelector('.tv-card__img')
    if (!!image.dataset.backdrop) {
        [image.src, image.dataset.backdrop] = [image.dataset.backdrop, image.src,]
    }
}

showsList.addEventListener('mouseover', eventHandler)
showsList.addEventListener('mouseout', eventHandler)


pagination.addEventListener('click', event => {
    const page = event.target.closest('a').textContent
    showsList.innerHTML = ''
    tvShow.append(loading)
    dbservice.getNextPage(page).then(renderCards)
})

//  clicking on a card opens a modal window

showsList.addEventListener('click', e => {
    e.preventDefault();

    const { target } = e;
    // section search with class = "tv-card"
    const tvCard = target.closest('.tv-card');

    if (tvCard) {
        preloader
        preloader.style.display = 'block'
        //  getting movie id
        const id = tvCard.dataset.idtv
        //  server request
        dbservice.getTvShow(id)
            .then(({ poster_path, name, genres, vote_average, overview, homepage }) => {
                if (poster_path) {
                    tvCardImg.src = IMG_URL + poster_path
                    tvCardImg.alt = name
                    posterWrapper.style.display = ''
                    modalContent.style.paddingLeft = ''
                } else {
                    posterWrapper.style.display = 'none'
                    modalContent.style.paddingLeft = '50px'
                }
                modalTitle.textContent = name
                genresList.innerHTML = genres
                    .map(genr => `<li>${genr.name}</li>`)
                    .join('')
                rating.textContent = vote_average
                description.textContent = overview
                if (homepage) {
                    modalLink.href = homepage
                } else {
                    modalLink.textContent = 'Официальная страница отсутствует'
                }
            }).then(() => {
                document.body.style.overflow = 'hidden';
                preloader.style.display = 'none'
                modal.classList.remove('hide')
            })
    }
}, false);

//  clicking on the modal wrapper or on the cross icon closes the modal window
modal.addEventListener('click', ({ target }) => {
    const isModal = target.classList.contains('modal')
    const isCloseModal = target.closest('.cross')

    if (isModal || isCloseModal) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

//  Movie Search Request Processing
searchForm.addEventListener('submit', event => {
    event.preventDefault()
    const value = searchFormInput.value.trim()
    if (value) {
        tvShow.append(loading)
        dbservice.getSearchResult(value).then(renderCards)
    }
    searchFormInput.value = ''
})

//  rendering of cards based on data received from a json file
const renderCards = (response, target) => {
    const results = response.results
    // use decomposition for each object with information about the film
    // also rename the object fields we need

    showsList.innerHTML = ''
    tvShowsHead.textContent = target ? target.textContent : `Результат поиска `
    if (results.length) {
        results.forEach(({
            vote_average: vote,
            poster_path: poster,
            backdrop_path: backdrop,
            name: title,
            id
        }) => {

            const posterURI = poster ? `${IMG_URL + poster}` : DEFAULT_IMG;
            const backdropURI = backdrop ? `${IMG_URL + backdrop}` : '';
            const voteEl = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

            const card = document.createElement('li');
            card.classList.add('tv-shows__item');
            card.innerHTML = `
            <a href="#" data-idtv="${id}" class="tv-card">
                ${voteEl}
                <img class="tv-card__img"
                     src="${posterURI}"
                     data-backdrop="${backdropURI}"
                     alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
            loading.remove()
            showsList.append(card);
        })

        pagination.textContent = " "
        if (response.total_pages > 1) {
            const total = response.total_pages <= 7 ? response.total_pages : 7
            const currentPage = response.page
            for (let i = 1; i <= total; i++) {
                if (i === currentPage) {
                    pagination.innerHTML += `<li><a href="#" class="active">${i}</a></li>`
                } else {
                    pagination.innerHTML += `<li><a href="#" >${i}</a></li>`
                }

            }
        }
    } else {
        loading.remove()
        tvShowsHead.textContent = 'По вашему запросу ничего не найдено'
        tvShowsHead.style.cssText = 'color: red'
        // showsList.innerHTML = '<span>По вашему запросу ничего не найдено</span>'
    }
}

{
    //  retrieving movie data from a local json file
    // tvShow.append(loading)
    // dbservice.getTestData().then(renderCards)
}
