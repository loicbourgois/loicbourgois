const celp = {}
window.celp = celp
const t = (line) => {
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
          return `celp[${e[i]}](${t(e.slice(1).join(" "))})`
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
    return e
  }
  throw "e2"
}
celp.t = t
celp.run = (program) => {
  const lines = program.split("\n")
  for (let line of lines) {
    // line = line.trim()
    // const e = line.split('"')
    // console.log(e)
    console.log(`${line} `)
    if (line.startsWith("#")) {
      continue
    }
    const tl = celp.t(line)
    console.log(`  ${tl}`)
    if (tl) {
      const ev = eval(tl)
      const json = JSON.stringify(ev)
      if (json) {
        console.log(`  -> ${json}`)
      } else {
        console.log(`  -> ${ev}`)
      }
    }
    // console.log(e)
  }
  // console.log(lines)
}
celp.run(`
celp['<-']=(left,right)=>celp[left]=right
a <- 10
a
12
# "12"
# "hello" " " "world"
# "hello"" ""world"
# "hello" + " " + "world"
# concat "hello" " " "world"
`)
