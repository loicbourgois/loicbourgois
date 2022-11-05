const DEBUG_WORDS = true
const DEBUG_TRANSLATIONS = true


const program = `
#1 + 1 * 4
#( 1 + 1 ) * 4
#is -> left === right
second -> left
meter -> left
meter_per_second -> left
kilometer -> left * 1000
hour -> left * 3600
kilometer_per_hour -> left / 1000 * 3600
speed -> right.distance / right.duration
a <- {}
a.duration <- 2 second
a.distance <- 20 meter
speed ( a )
1 meter_per_second
1 kilometer_per_hour
( 1 kilometer_per_hour ) meter_per_second

log -> console.log ( left ) ? "" : "" + left
log "zoop"

// b meter_per_second
// b kilometer_per_hour

#add_one -> right + 1
#and -> left && right ? true : false
#bob -> 2
#bob
// 1 second
// 1 hour + 2 second
#1 is 1
#( 1 + 1 ) second is 1
// 0 and 2
// "0" and "2"
// 1 and "2"
// 1 and 0 + 1
// b -> "s"
// b
# sum 2 1
# meter -> left
# speed -> right.distance / right.duration
# speed ( distance : 1 meter , duration : 2 second )
# 2 * 6 + 3 * 4 / 3 * 7
`


const jlog = (x) => {
  console.log(JSON.stringify(x, null, 2))
}


const t = (x) => x


const celp = {
  internal: {
    tree: [],
    keys: {
      '->': 0
    },
    keys_by_priority: [
      ['->', '<-'],
      ['+', '-'],
      ['*', '/'],
      []
    ],
  },
  '->': (left, right) => {
    celp.internal.keys_by_priority[3].push(left)
    left = left.split(".").map(x=>`['${x}']`).join('')
    if (right.includes("left") && right.includes("right") ) {
      return eval(`celp${left} = (left, right) => ${t(right)} `)
    } else if ( right.includes("left") ) {
      return eval(`celp${left} = (left) => ${t(right)} `)
    } else if ( right.includes("right") ) {
      return eval(`celp${left} = (right) => ${t(right)} `)
    } else {
      return eval(`celp${left} = () => ${t(right)} `)
    }
  },
  '<-': (left, right) => {
    celp.internal.keys_by_priority[3].push(left)
    left = left.split(".").map(x=>`['${x}']`).join('')
    return eval(`celp${left}=${right}`)
  }
}


const get_words = (line) => {
  let words = []
  let start = 0
  let parenteses_count = 0
  for (let i = 0 ; i < line.length ; i++) {
    const char = line[i]
    if (char === '(' && parenteses_count == 0) {
      words.push( line.slice(start+1, i+1) )
      start = i
    }
    if (char === '(' ) {
      start = i;
      parenteses_count += 1
    }
    if (char === ')') {
      parenteses_count -= 1
    }
    if (char === ')' && parenteses_count == 0 && start == 0 && i == line.length-1) {
      words = [...words, ...get_words(line.slice(start+1, i)) ]
      break
    } else if (char === ')' && parenteses_count == 0) {
      words.push( `(${line.slice(start+1, i)})`  )
      start = i+1
    }
    if (char === ' ' && parenteses_count == 0) {
      words.push( line.slice(start, i) )
      start = i+1
    }
    if (i === line.length - 1) {
      words.push( line.slice(start, i+1) )
    }
  }
  words = words.map(x=>x.trim())
  words = words.filter(x => x.length)
  return words
}


const build_tree = (line, parent = null) => {
  const words = get_words(line)
  if (DEBUG_WORDS) {
    console.log(`    word(${parent})`, words)
  }
  if (words.length == 0) {
    return undefined
  }
  for (let ik = 0; ik < celp.internal.keys_by_priority.length ; ik+=1 ) {
    const ks = celp.internal.keys_by_priority[ik]
    for (var i = words.length-1; i > -1; i--) {
      const word = words[i]
      if (ks.includes(word)) {
        let r = {}
        r[word]={}
        let left = build_tree(words.slice(0,i).join(" "), word)
        if (left !== undefined) {
          r[word].left = left
        }
        let right = build_tree(words.slice(i+1,words.length).join(" "), word)
        if (right !== undefined) {
          r[word].right = right
        }
        return r
      }
    }
  }
  return line
}


const translate = (subtree) => {
  const k = Object.keys(subtree)[0]
  let left = subtree[k]['left']
  if (left instanceof Object) {
    left = translate(subtree[k]['left'])
  } else {
    left = `${left}`
  }
  let right = subtree[k]['right']
  if (right instanceof Object) {
    right = translate(subtree[k]['right'])
  } else if(right !== undefined) {
    right = `${right}`
  }
  let f = undefined
  let ok = true
  let base = celp
  for (let k_ of k.split(".")) {
    if ( Object.keys(base).includes(k_) ) {
      base = base[k_]
    } else {
      ok = false
      break
    }
  }
  if (ok) {
    f = `celp${ k.split(".").map(x=>`['${x}']`).join(``) }`
  }
  if ( f ) {
    if (k == '->' || k == '<-') {
      return `${f}('${left}', \`${right}\`)`
    } else if (left !== undefined && right !== undefined && left !== 'undefined' && right !== 'undefined' ){
      return `${f}(${left}, ${right})`
    } else if (left !== 'undefined') {
      return `${f}(${left})`
    } else if (right !== undefined) {
      return `${f}(${right})`
    } else if ( f instanceof Function ) {
      return `${f}()`
    } else {
      return `${f}`
    }
  } else {
    if (left !== 'undefined' && right !== 'undefined') {
      return `( ${left} ) ${k} ( ${right} )`
    } else if (left !== 'undefined') {
      return `( ${left} ) ${k}`
    } else if (right !== 'undefined') {
      return `${k} ( ${right} )`
    } else {
      return `${k}`
    }
  }
}


const parse = (program) => {
  const tree = []
  for (let line of program.split("\n")) {
    if (!line.length) {
      continue
    }
    if (line.startsWith("#")) {
      continue
    }
    if (line.startsWith("//")) {
      continue
    }
    let subtree = build_tree(line)
    if (! (subtree instanceof Object) ) {
      let a = {}
      a[subtree] = {}
      subtree = a
    }
    const translation = translate(subtree)
    celp.internal.tree.push(subtree)
    console.log(line)
    if (DEBUG_TRANSLATIONS) {
      console.log(" ",translation)
    }
    console.log("  ->",eval(translation))
  }
}

window.celp = celp
try {
  parse(program)
} catch (e) {
  console.error(e);
  // jlog(celp)
}
// jlog(celp)
//
