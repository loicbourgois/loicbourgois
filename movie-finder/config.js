const get_config = (hostname) => {
    if ( hostname === 'localhost' ) {
        return {
            "server": "localhost:3000",
        }
    } else {
        throw `invalid hostname: ${hostname}`
    }
}


export {
    get_config,
}
