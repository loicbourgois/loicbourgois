import { 
    get_config
} from "./config.js"
import { 
    fetch_
} from "./fetch.js"


const search = async (search_str) => {
    const config = get_config(window.location.hostname)
    const r = await fetch_(`https://${config.server}/search/${search_str}`)
    console.log(r)
}


export {
    search,
}
