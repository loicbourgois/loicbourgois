const get_config = (hostname) => {
    if ( hostname === 'localhost' ) {
        return {
            "server": "localhost:3000",
            // "server": "api.loicbourgois.com:3000",
        }
    } else  if ( hostname === 'loicbourgois.com' ) {
        return {
            "server": "api.loicbourgois.com:3000",
        }
    } else {
        throw `invalid hostname: ${hostname}`
    }
}


export {
    get_config,
}
