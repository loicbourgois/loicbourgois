const base_url = "https://api.loicbourgois.com:9000"
const base_url_client = `${window.location.origin}/downtowhat`


const base_html = `
    <div id="header">
        <a id="random" href="/">Get lucky</a>
        <input id="search" placeholder="Search" onchange="trigger_search()"></input>
    </div>
`


const get_inner = async(url) => {
    const response = await fetch(url, {
        method: 'get',
    });
    return response;
}


const get = async(path) => {
    return await get_inner(path).then( async (response) => {
        return await response.json()
    })
}


const omdb_url = (movie) => {
    let img_url = null
    let omdbs = []
    if (movie.omdbs) {
        omdbs = Object.values(movie.omdbs);
    }
    if (omdbs.length) {
        img_url = omdbs[0].img_url
    }
    return img_url
}


const languages = {
    'en': 1,
    'fr': 2,
}


const title = (movie) => {
    let titles = Object.entries(movie.titles).sort((a,b) => {
        const aa = languages[a[0]]
        const bb = languages[b[0]]
        if (aa && bb) {
            return aa > bb
        } else if (aa) {
            return false
        } else if (bb) {
            return true
        }
    })
    .map(x => {
        return x[1]
    })
    return titles[0]
}


const get_name = (names) => {
    let values = Object.entries(names).sort((a,b) => {
        const aa = languages[a[0]]
        const bb = languages[b[0]]
        if (aa && bb) {
            return aa > bb
        } else if (aa) {
            return false
        } else if (bb) {
            return true
        }
    })
    .map(x => {
        return x[1]
    })
    return values[0]
}


const imdb_link = (movie) => {
    const imdb_ids = Object.keys(movie.imdb)
    if (imdb_ids.length > 0) {
        return `https://www.imdb.com/title/` + imdb_ids[0]
    } else {
        return ""
    }
}


const wikidata_link = (movie) => {
    return `https://www.wikidata.org/wiki/` + movie.id
}


const genres = (movie) => {
    const aa = Object.keys(movie.genres).map(x => {
        const txt = Object.keys(movie.genres[x])[0]
        return `<a href="${base_url_client}?search=${txt}">${txt}</a>`
    })
    return aa.join('')
}

const show_movie = async (movie) => {
    console.log(movie)
    document.querySelector("body").innerHTML += `
        <div>
            <h1>${title(movie)}</h1>
            <div id="links">
                <a href="${wikidata_link(movie)}">wikidata</a>
                <a href="${imdb_link(movie)}">imdb</a>
                <a href="${imdb_link(movie)}/reviews">reviews</a>
            </div>
            <div id="genres">
                ${genres(movie)}
            </div>
            <div class="movies">
                <div class="movie">
                    <a class="movie_poster" href="${base_url_client}?get=${movie.id}" >
                        <img src="${omdb_url(movie)}">
                    </a>
                </div>
            </div>
        </div>
    `
    for (const xx of [
        {
            'key': 'directors',
            'about': 'director',
        },
        {
            'key': 'composers',
            'about': 'composer',
        },
        {
            'key': 'cast_members',
            'about': 'cast member',
        },
        {
            'key': 'voice_actors',
            'about': 'voice actor',
        },
    ]) {
        Object.entries(movie[xx.key]).map((x)=> {
            const v = x[1]
            const movies = Object.entries(v.movies)
                .filter((x2) => {
                    return omdb_url(x2[1])
                })
                .map((x2) => {
                    return `
                    <div class="movie">
                        <a class="movie_poster" href="${base_url_client}?get=${x2[1].id}" >
                            <img src="${omdb_url(x2[1])}">
                        </a>
                    </div>
                    `
                })
                .join("")
            document.querySelector("body").innerHTML += `
                <h2><a href="${base_url_client}?search=${get_name(v.names)}">${get_name(v.names)} (${xx.about})</a></h2>
                <div class="movies">
                    ${movies}
                </div>
            `
        })
    }
}


const show_movies = async (moviess) => {
    let str_ =  `<div class="movies"></div><div class="movies">`
    const ids = {}
    for (const movies of moviess) {
        for (const movie of movies) {
            if (!omdb_url(movie)) {
                continue
            }
            if (ids[movie.id]) {
                continue
            }
            ids[movie.id] = true
            str_ += `
                <div class="movie">
                    <a class="movie_poster" href="${base_url_client}?get=${movie.id}" >
                        <img src="${omdb_url(movie)}">
                    </a>
                </div>
            `
        }
    }
    str_ += `
        </div>
    `
    document.querySelector("body").innerHTML += str_
}


const show_random_movie = async () => {
    const r = await get(`${base_url}/random-movie`)
    show_movie(r)
}


const trigger_search = () => {
    console.log(document.getElementById("search").value )
    window.location.href = window.location.origin + "/downtowhat?search=" + document.getElementById("search").value;
}


const main = async () => {
    document.querySelector("body").innerHTML = base_html
    document.trigger_search = trigger_search
    const params = new URLSearchParams(window.location.search);
    if (params.get('get')) {
            const r = await get(`${base_url}/get_json/${params.get('get')}`)
            show_movie(r)
    } else if (params.get('search')) {
        const r = await get(`${base_url}/search_json/${params.get('search')}`)
        show_movies(r)
    } else {
        show_random_movie()
    }
}
main()
