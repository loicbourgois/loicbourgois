const translate_splitted = (splitted) => {
    switch (splitted[1]) {
      case "f":
        splitted[1] = "frequency"
        break
      case "frequency":
        splitted[1] = "frequency"
        break
      case "d":
        splitted[1] = "detune"
        break
      case "g":
        splitted[1] = "gain"
        break
      default:
        throw `not handled: ${splitted[1]}`
    }
    return splitted
  }
export {
    translate_splitted,
}