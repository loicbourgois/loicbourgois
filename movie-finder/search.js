import * as api from "./api.js";
import { 
    setup_events
} from "./shared.js"


const search = async (search_str) => {
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;

        document.head.appendChild(link);
    }
    loadCSS('../index.css');
    const r = await api.search(search_str)
    console.log(r)
    document.body.innerHTML = `
        <div id="top">
            <button id="button_random">Random</button>
            <input type="text" value="${decodeURIComponent(search_str)}">
            <button id="button_search">Search</button>
        </div>
        <div id="content">
        </div>
    `
    for (const x of r.results) {
        document.getElementById("content").innerHTML += `
            <div class="media">
                <a class="glow" href="https://${window.location.hostname}/movie-finder/${x.qid}" class="image_wrapper">
                    <img src="${x.omdb_image_link}">
                </a>
                <a href="https://${window.location.hostname}/movie-finder/${x.qid}">${x.label}</a>
                <div class="links">
                    <a target="_blank" href="${x.imdb_link}">imdb</a>
                </div>
            </div>
        `
    }
    setup_events()
}


export {
    search,
}
