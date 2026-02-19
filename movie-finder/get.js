

const get_inner = async(url) => {
    const response = await fetch(url, {
        method: 'get',
    });
    return response;
}


const get = async(path) => {
    return await get_inner(path).then( async (response) => {
        return await response.json()
    })
}


export {
    get,
}
