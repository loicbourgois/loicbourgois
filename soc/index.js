const bank = {
  rice: 1,
  wood: 1,
}
const a = {
  name: "a",
  money: 0,
  wood: 0,
  satiated: 2,
  famished: 0,
  hungry: 0,
  rice: 0,
  meal: 0,
}
const b = {
  name: "b",
  money: 0,
  wood: 0,
  satiated: 2,
  hungry: 0,
  famished: 0,
  rice: 0,
  meal: 0,
}
const do_something = (player) => {
  if (player.satiated > 0) {
    player.satiated -= 1
    player.hungry += 1
    return 1.0
  } else if (player.hungry > 0) {
    player.hungry -= 1
    player.famished += 1
    return 0.5
  }
}
const collect_rice = (player) => {
  player.rice += parseInt(10 * do_something(player))
}
const collect_wood = (player) => {
  player.wood += parseInt(10 * do_something(player))
}
const cook_rice = (player) => {
  player.meal += parseInt(4 * do_something(player))
  player.rice -= 4
  player.wood -= 4
}
const eat = (player) => {
  if (player.famished > 0) {
    player.famished -= 1
    player.hungry += 1
  } else if (player.hungry > 0) {
    player.hungry -= 1
    player.satiated += 1
  }
  player.meal -= 1
}
const steps = [
  [a, collect_rice],
  [a, collect_wood],
  [a, cook_rice],
  [a, eat],
  [a, eat],
  [a, cook_rice],
  [a, eat],
  [a, eat],
  // [a, eat],
  // [a, eat],
]
const state = () => {
  let str = " "
  const ks = ['satiated', 'hungry', 'famished', 'rice', 'wood', 'money', 'meal']
  for (const k of ks) {
    str += ` | ${k}`
  }
  str += `\na `
  for (const k of ks) {
    str += `| `
    const v = `${a[k]}`
    const spaces = k.length - v.length
    for (let index = 0; index < spaces; index++) {
      str += " "
    }
    str += `${v} `
  }
  str += `\nb `
  for (const k of ks) {
    str += `| `
    const v = `${b[k]}`
    const spaces = k.length - v.length
    for (let index = 0; index < spaces; index++) {
      str += " "
    }
    str += `${v} `
  }
  return str
}
console.log(state())
for (const step of steps) {
  const player = step[0]
  const action = step[1]
  console.log(`@${player.name} ${action.name}`)
  action(player)
  console.log(state())
}
