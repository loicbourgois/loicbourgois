const organize = (transforms, iter=0) => {
  // if (iter > 100) {
  //   throw "too many iter"
  // }
  for (const transform of transforms) {
    if (transform.deletes) {
      for (const delete_ of transform.deletes) {
        for (let index = 0; index < transforms.length; index++) {
          const transform_2 = transforms[index];
          if ( 
            transform_2.inputs 
            && transform_2.inputs.length==1 
            && transform_2.inputs[0].i == delete_.i 
          ) {
            transforms[index] = {
              inputs:[],
              outputs:[],
            }
          }
        }
      }
    }
  }
  const blocks_next = {}
  const conflicts = new Set()
  for (const transform of transforms) {
    for (const output of transform.outputs) {
      const bn = blocks_next[output.i]
      if ( bn === undefined ) {
        blocks_next[output.i] = structuredClone(output.b)
      } else {
        conflicts.add(output.i)
      }
    }
  }
  if (conflicts.size != 0) {
    for (const conflict of conflicts) {
      for (const transform of transforms) {
        if (transform.outputs.some( o => o.i == conflict )) {
          for (const input of transform.inputs) {
            if (input.scoring) {
              score[input.scoring] -= 1;
            }
          }
          transform.outputs = structuredClone(transform.inputs)
          transform.deletes = []
        }
      }
    }
    return organize(transforms, iter+1)
  } else {
    return blocks_next
  }
}


export {
    organize,
}