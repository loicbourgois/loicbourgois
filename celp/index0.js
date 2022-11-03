// const head =
// const rest = (l) => l.length?l.slice(1,l.length):[]
// const sum =
// // const list = (l) => l.length?[head(l),...rest(l)]:[]
// const square = (l) => l.length?[head(l) * head(l), ...square(rest(l)) ]:[]
// const celp = {
//   data: {},
//   transform: {},
//   ctransform: {},
//   left_transform: {},
// }
//
// celp.transform.head = (l) => l.length?l[0]:undefined
// celp.transform.rest = (l) => l.length?l.slice(1,l.length):[]
// celp.transform.sum = (l) => l.length?celp.transform.head(l)+celp.transform.sum(celp.transform.rest(l)):0
// celp.transform.increment = (l) => l.length ? [ celp.transform.head(l) + 1, ...celp.transform.increment( celp.transform.rest(l) ) ] : []
// celp['ctransform']['>'] = (l) => l[0] > l[1]
// celp['ctransform']['greater_than'] = (l) => l[0] > l[1]
// celp['data']['empty'] = []
//
// // celp['left_transform']['major'] = (left) => l[0] > l[1]
//
//
// console.log(celp.transform.head(3))
// console.log(celp.transform.increment([3, 7]))
// console.log(celp.transform.increment(3))
//
//
// const program = `
// age <- 16
// age
// age > 10
// bob <- empty
// bob.age <- 15
// bob.age greater_than 10
// is_major -> left.age > 18
// bob is_major
// `
//
//
// // translate
// const t = (line) => {
//   const e = line.split(" ")
//   if (e[1] == '<-') {
//     if ( celp.transform[e[2]] ) {
//       return `celp.data.${e[0]}=celp.transform.${e[2]}([${e.slice(3,e.length).map(x => celp.data[x]?"celp.data."+x:x ) }])`
//     } else {
//       return `celp.data.${e[0]}=${t(e[2])}`
//     }
//   }
//   if (celp['ctransform'][e[1]]) {
//     return `celp['ctransform']['${t(e[1])}']([${t(e[0])},${t(e[2])}])`
//   }
//   if (celp['left_transform'][e[1]]) {
//     return `celp['left_transform']['${t(e[1])}']([${t(e[0])}])`
//   }
//   if (e.length == 1 && celp.data[e[0].split('.')[0]]) {
//     return `celp.data.${e[0]}`
//   }
//   if (e[1] == '->') {
//     // if ()
//     return `celp['left_transform']['${e[0]}'] = (left) => ${ t(e.slice(2,e.length).join(' ')) }`
//   }
//   return line
// }

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
  const lines = program.split("\n")
  lines.forEach((line, i) => {
    console.log(`${line} `)
    if (line.startsWith("#")) {
      return
    }
    const tr = t(line)
    console.log(`  ${tr} `)
    if (tr) {
      const ev = eval(tr)
      const json = JSON.stringify(ev)
      if (json) {
        console.log(`  -> ${json}`)
      } else {
        console.log(`  -> ${ev}`)
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
kilometer_per_hour -> right.distance / 1000 / right.duration * 3600
kilometer_per_hour data
meter_per_second data
`

window.celp = celp

// celp['is_major'] = (left) => left > 18


run(program)
// console.log(celp['is_major'])


// console.log(celp.transform.add_one(0))


  // sum: sum,
  // head: head,
  // square: square,
  // rest: rest,



// const input = (i) => {
//   let value = ""
//   let disabled = ""
//   let placeholder = ""
//   if (i==0) {
//     placeholder = "value"
//     // disabled = "disabled"
//   }
//   if (i==1) {
//     placeholder = "name"
//   }
//   if (i==2) {
//     placeholder = "operator"
//   }
//   return `<input class="cell" placeholder="${placeholder}" value="${value}" ${disabled}></input>`
// }
// const inputs = (count) => {
//   return Array.apply(null, Array(count)).map((x,i) => input(i) ).join("")
// }
// const row = (width) => {
//   return `
//     <div class="row">
//       ${ inputs(width) }
//     </div>
//   `
// }
// const rows = (width, height) => {
//   return Array.apply(null, Array(height)).map(() => row(width)).join("")
// }
// document.body.innerHTML = `
//   <table>
//     ${rows(10, 20)}
//   </table>
// `
//
// console.log( celp.rest([1, 2]) )
// console.log(  celp.sum([1,2])  )
// console.log(square([3]))
// console.log(square([3,4]))
// // console.log(list([3,5]))
// console.log(2)
//
// console.log(eval( "sum([1,2,3])" ))

// console.log(list([2,3,4]))
// console.log( celp. )
