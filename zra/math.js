


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let r = Math.floor(Math.random() * (max - min + 1)) + min;
    return r;
  }

export {
    getRandomInt,
}