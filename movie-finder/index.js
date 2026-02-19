import { 
    get_config
 } from "./config.js"
import { 
    get
 } from "./get.js"


const main = async () => {
    const config = get_config(window.location.hostname)
    const r = await get(`https://${config.server}/about`)
    // const r = await get(`http://api.loicbourgois.com:3000/about`)
    // const r = await get(`https://localhost:3000/about`)
    // const r2 = await get(`https://127.0.0.1:3000/about`)
    // const r2 = await get(`https://api.loicbourgois.com:3000/about`)
    console.log(r)
}
main()
