const copy = (x) => {
  if (x instanceof Object) {
    return {...x}
  } else {
    return x
  }
}


const t = (line) => {
  line = line.split('(').map(x => ` ${x} `).join("(")
  line = line.split(')').map(x => ` ${x} `).join(")")
  line = line.split(" ").filter( x => x ).join(" ")
  // Data definition
  let e = line.split(" <- ")
  if (e.length > 1) {
    return `celp${e[0].split(".").map(x=>`['${x}']`).join('')} = copy(${t(e[1])})`
  }
  // Transform definition
  e = line.split(" -> ")
  if (e.length > 1) {
    if (e[1].includes("left") && e[1].includes("right") ) {
      return `celp${e[0].split(".").map(x=>`['${x}']`).join('')} = (left, right) => ${t(e[1])} `
    } else if ( e[1].includes("left") ) {
      return `celp.${e[0].split(".").map(x=>`${x}`).join('')} = (left) => ${t(e[1])} `
    } else if ( e[1].includes("right") ) {
      return `celp.${e[0].split(".").map(x=>`${x}`).join('')} = (right) => ${t(e[1])} `
    } else {
      return `celp.${e[0].split(".").map(x=>`${x}`).join('')} = () => ${t(e[1])} `
    }
  }
  //
  const data = `celp${e[0].split(".").map(x=>`['${x}']`).join('')}`
  try {
    if (eval(data)) {
      return data
    }
  } catch (e) {}
  //
  e = line.split(" ")
  if (e.length>1) {
    // Transform application
    for (let i = 0; i < e.length; i++) {
      if ( celp[e[i]] instanceof Function ) {
        if (i == 0) {
          return `${t(e[0])}( ${t(e.slice(1,e.length).join(" "))} )`
        } else if (i == 1 && e.length == 2) {
          return `${t(e[1])}( ${t(e[0])} )`
        } else if (i == 1 && e.length > 2) {
          return `${t(e[1])}( ${t(e[0])}, ${t(e.slice(2,e.length).join(" "))} )`
        }
      }
    }
    //
    return e.map(x => t(x)).join(" ")
  }
  return e[0]
}


const celp = {}


const run = (program) => {
  program = program.replaceAll("\n  ", "  ")
  // console.log(program)
  const lines = program.split("\n")
  lines.forEach((line, i) => {
    console.log(`${line} `)
    if (line.startsWith("#")) {
      return
    }
    const tr = t(line)
    // console.log(`  ${tr} `)
    if (tr) {
      const ev = eval(tr)
      const json = JSON.stringify(ev)
      if (json) {
        console.log(`    ${json}`)
      } else {
        console.log(`    ${ev}`)
      }
    }
  });
}


const program = `
empty <- {}
throw -> {throw right}
assert -> right ? true : throw("assert failed")
sqrt -> Math.sqrt(right)
len -> right.length

12
12 + 3
age <- 16
age
age <- 16 + 3
age > 18
bob <- empty
bob.age <- 19
bob.age
bob
bob.age > 10
is_major -> left.age > 18
is_older_than -> left.age ? right.age ? left.age > right.age : undefined : undefined
bob is_major
alice <- empty
alice.age <- 21
bob is_older_than alice
bob is_older_than 2
sqrt 16
sqrtsqrt -> sqrt sqrt right
sqrtsqrt 16
sqrt
assert alice is_older_than bob
and -> left && right ? true : false
1 and 2 and 3
is -> left === right
assert 1 is 1
bob is alice
len "efe"
len [2, 3, 4]
data <- empty
second -> left
meter -> left
kilometer -> left * 1000
hour -> left * 3600
data.distance <- 10 kilometer
data.duration <- 1 hour
meter_per_second -> right.distance / right.duration
meter_per_second data
kilometer_per_hour ->
  right.distance && right.duration ?
    right.distance / 1000 / right.duration * 3600
    : right / 1000 * 3600
kilometer_per_hour data
meter_per_second data
len "ob bo"
speed -> right.distance / right.duration
speed data
data.speed <- speed data
kilometer_per_hour data.speed
speed { distance : 1 meter , duration : 2 second }
`
window.celp = celp
run(program)
