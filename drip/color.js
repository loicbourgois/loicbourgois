import {
    getRandomInt
  } from "./math.js"

const get_base_colors = (count) => {
    let baseColors = [];
    baseColors.push(
      [
        getRandomInt(64, 255) / 255,
        getRandomInt(64, 255) / 255,
        getRandomInt(64, 255) / 255,
      ]
    );
    for (let i = 0 ; i < count ; i++) {
      const ouia = 128
      if (i>0) {
        baseColors.push(
          [
            baseColors[i-1][0] + getRandomInt(0, ouia)/255,
            baseColors[i-1][1] + getRandomInt(0, ouia)/255,
            baseColors[i-1][2] + getRandomInt(0, ouia)/255
          ]
        );
      }
      let max = Math.max(Math.max(baseColors[i][0], baseColors[i][1]), baseColors[i][2]);
      baseColors[i][0] = baseColors[i][0] / max;
      baseColors[i][1] = baseColors[i][1] / max;
      baseColors[i][2] = baseColors[i][2] / max;
    }
    return baseColors
  }
  
  
  function getColors (count, base_count) {
    let colors = [];
    const baseColors = get_base_colors(base_count)
    for (let i = 0 ; i < count+1 ; i ++) {
      let ii = Math.max(0, Math.floor((i-1)/base_count));
      ii = i % base_count;
      colors.push([
        (i * baseColors[ii][0] / count), 
        (i * baseColors[ii][1] / count), 
        (i * baseColors[ii][2] / count), 
        1.0
      ]);
    }
    return colors;
  }

  export {
    getColors
  }