
const get_middle = (e) => {
    const rect = e.getBoundingClientRect();
    const middleX = rect.left + rect.width / 2;
    const middleY = rect.top + rect.height / 2;
    return {x:middleX,y:middleY}
}

export {
    get_middle,
}