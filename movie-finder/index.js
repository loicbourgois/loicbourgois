import { 
    get_config
 } from "./config.js"
import { 
    get
 } from "./get.js"


const main = async () => {
    const config = get_config(window.location.hostname)
    const r = await get(`http://${config.server}/about`)
    console.log(r)
}
main()
