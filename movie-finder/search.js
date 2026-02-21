import * as api from "./api.js";


const search = async (search_str) => {
    const r = api.search(search_str)
    console.log(r)
}


export {
    search,
}
