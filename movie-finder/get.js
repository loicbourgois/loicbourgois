import * as api from "./api.js";


const get = async (qid) => {
    const r2 = await api.get(qid)
    document.body.innerHTML = `
        <div id="content">
        </div>
    `
    document.getElementById("content").innerHTML += `
        <div class="media">
            <a class="glow" href="https://${window.location.hostname}/movie-finder/${r2.media.qid}" class="image_wrapper">
                <img src="${r2.media.omdb_image_link}">
            </a>
            <a href="https://${window.location.hostname}/movie-finder/${r2.media.qid}">${r2.media.label}</a>
            <div class="links">
                <a target="_blank" href="${r2.media.imdb_link}">imdb</a>
            </div>
        </div>
    `
    for (const x of r2.recommandations) {
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
}


export {
    get,
}
