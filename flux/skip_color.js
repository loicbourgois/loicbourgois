const skip_color = (r, g, b) => {
  let c128 = 0;
  let c256 = 0;
  if (r == 128) c128 += 1
  if (g == 128) c128 += 1 
  if (b == 128) c128 += 1 
  if (r == 256) c256 += 1 
  if (g == 256) c256 += 1 
  if (b == 256) c256 += 1 
  // if (r+g+b < 128) {
  //   return true
  // }
  if (c128 == 0 && c256 == 0) {
    return true
  } else if (c128 == 2 && c256 == 0) {

  } else if (c128 == 3) {

  } else {
    return false
  }
  if (c256 == 3) {
    return false
  }
  if (c256 == 2 && c128 == 1) {
    return false
  }
  if (c256 == 1 && c128 == 2) {
    return false
  }
  if (c256 == 1 && c128 == 1) {
    return false
  }
  if (c256 == 1 && c128 == 0) {
    return false
  }
  // if (c128 < 1) {
  //   return true
  // }
  // if (c256 < 1) {
  //   return true
  // }
  // return false
  return true
}


export {
    skip_color,
}
