const i = (world, x, y) => {
  return x + y * world.unit_count
}


const assert = (condition, message) => {
  console.assert(condition)
  if (!condition) {
    throw `assert failed: ${message}`
  }
}


const set_block = (world, x, y, data) => {
  assert( data.k !== undefined, "invalid block" )
  world.blocks[i(world, x, y)] = data
}


export {
    set_block,
}
