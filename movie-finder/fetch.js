

const get_inner = async(url) => {
    const response = await fetch(url, {
        method: 'get',
    });
    return response;
}


const fetch_ = async(path) => {
    return await get_inner(path).then( async (response) => {
        return await response.json()
    })
}


export {
    fetch_,
}
