import {
    get_config
 } from "./config.js"
import { 
    fetch_
 } from "./fetch.js"


const main = async () => {
    const config = get_config(window.location.hostname)
    const r = await fetch_(`https://${config.server}/about`)
    console.log(r)
    const r2 = await fetch_(`https://${config.server}/random`)
    console.log(r2)
    document.getElementById("content").innerHTML += `
        <div class="media">
            <a href="https://${window.location.hostname}/movie-finder/${r2.media.qid}" class="image_wrapper">
                <img src="${r2.media.omdb_image_link}">
            </a>
            <a class="glow" href="https://${window.location.hostname}/movie-finder/${r2.media.qid}">${r2.media.label}</a>
            <div class="links">
                <a target="_blank" href="${r2.media.imdb_link}">imdb</a>
            </div>
        </div>
    `
    for (const x of r2.recommandations) {
        document.getElementById("content").innerHTML += `
            <div class="media">
                <a href="https://${window.location.hostname}/movie-finder/${x.qid}" class="image_wrapper">
                    <img src="${x.omdb_image_link}">
                </a>
                <a class="glow" href="https://${window.location.hostname}/movie-finder/${x.qid}">${x.label}</a>
                <div class="links">
                    <a target="_blank" href="${x.imdb_link}">imdb</a>
                </div>
            </div>
        `
    }
}
main()
