import { 
    get_config
} from "./config.js"
import { 
    get
} from "./get.js"


const search = async (search_str) => {
    const config = get_config(window.location.hostname)
    const r = await get(`http://${config.server}/search/${search_str}`)
    console.log(r)
}


export {
    search,
}
