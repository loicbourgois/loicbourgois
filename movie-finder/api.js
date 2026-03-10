import { 
    get_config
} from "./config.js"
import { 
    fetch_
} from "./fetch.js"


const search = async (search_str) => {
    const config = get_config(window.location.hostname)
    const r =  fetch_(`https://${config.server}/search/${search_str}`)
    return r
}

const search_review = async (search_str) => {
    const config = get_config(window.location.hostname)
    const r =  fetch_(`https://${config.server}/search/review/${search_str}`)
    return r
}

const get = async (qid) => {
    const config = get_config(window.location.hostname)
    const r = await fetch_(`https://${config.server}/get/${qid}`)
    return r
} 
    

export {
    get,
    search,
    search_review,
}
