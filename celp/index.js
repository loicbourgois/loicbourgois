const celp = {}
window.celp = celp
const t = (line) => {
  //
  {
    let e = line.split(" -> ")
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
  }
  // Tokenize
  line = line.trim()
  if (!line.length) {
    return undefined
  }
  let ee = line.split('"')
  for (let i = 1; i < ee.length; i+=2) {
    ee[i] = [`"${ee[i]}"`]
  }
  for (let i = 0; i < ee.length; i+=2) {
    ee[i] = ee[i].split(" ")
  }
  let e = []
  for (let ee_ of ee) {
    e = [...e, ...ee_]
  }
  for (let i = 0; i < e.length; i++) {
    e[i] = e[i].trim()
  }
  e = e.filter(x=>x.length)
  // console.log(e)
  //
  for (let i = 0; i < e.length; i++) {
    if ( Object.keys(celp).includes( e[i] ) ) {
      if (i == 0) {
        if (celp[e[i]] instanceof Function) {
          return `celp['${e[i]}'](${t(e.slice(1).join(" "))})`
        } else {
          return `celp['${e[i]}']`
        }
      } else if (i == 1) {
        return `celp['${e[i]}']('${t(e[0])}', ${t(e.slice(2).join(" "))})`
      }else {
        throw "e1"
      }
    }
  }
  if (e.length == 1) {
    return e[0]
  } else {
    return e.join(" ")
  }
  throw "e2"
}
celp.t = t
celp.run = (program) => {
  const lines = program.split("\n")
  for (let line of lines) {
    console.log(`> ${line} `)
    if (line.startsWith("#")) {
      continue
    }
    if (line.startsWith("//")) {
      continue
    }
    const tl = celp.t(line)
    console.log(`  ${tl}`)
    if (tl) {
      const ev = eval(tl)
      const json = JSON.stringify(ev)
      if (json) {
        // console.log(`${json}`)
      } else {
        // console.log(`${ev}`)
      }
    }
  }
}

// celp['->'] = (left, right) => {
//
//   console.log("zzz",right)
//
//   // if (right.includes("left") && right.includes("right") ) {
//   //     return `celp${left.split(".").map(x=>`['${x}']`).join('')} = (left, right) => ${t(right)} `
//   //   } else if ( right.includes("left") ) {
//   //     return `celp.${left.split(".").map(x=>`${x}`).join('')} = (left) => ${t(right)} `
//   //   } else if ( right.includes("right") ) {
//   //     return `celp.${left.split(".").map(x=>`${x}`).join('')} = (right) => ${t(right)} `
//   //   } else {
//   //     return `celp.${left.split(".").map(x=>`${x}`).join('')} = () => ${t(right)} `
//   //   }
//   }



// celp['->']= (left,right)=>{
//   celp[left] = () => eval("'"+right+"'")
// }

// console.log( celp['->']('bob', 2) )
// console.log( celp['bob']() )

// celp['->'] = (left, right) => {
//   celp[left] = eval( `(right)=>${right}` )
// }
// celp['len']=(right)=>right.length

celp.run(`
len -> right.length
log -> console.log(right)
throw -> {throw(right)}
assert -> right ? true : "assert failed"
log len "hello"
assert 1 is 1
// concat -> [left, right].join('')
// "hello" "world"
// "owrld" concat "hello"
`)

// #a
// #end
// #a -> "e"
// #aa -> 1
// #aa 2
// #sqrt 4
// # throw -> {throw right}
// a <- (v)=>Math.sqrt(v)
// # a 2
// # 12
// # "12"
// # "hello" " " "world"
// # "hello"" ""world"
// # "hello" + " " + "world"
// # concat "hello" " " "world"
