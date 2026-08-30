import { Kind } from "./kind.js"
import { Direction } from "./direction.js"


// We won't go under 128/256 for rgb values
// 128 is ok
const limit = 128;


const down = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = x;
  const y_new = (y+1) % uc;
  return x_new + y_new * uc
}


const left = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = (x-1 + uc) % uc;
  const y_new = y;
  return x_new + y_new * uc
}


const up = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = x;
  const y_new = (y-1+uc)%uc;
  return x_new + y_new * uc
}


const right = (i, uc) => {
  const x = i % uc
  const y = parseInt(i / uc)
  const x_new = (x+1 + uc) % uc;
  const y_new = y;
  return x_new + y_new * uc
}


const continue_from_to = (i, b, inew) => {
  return {
      inputs: [{
        i:i,
        b:structuredClone(b),
      }],
      outputs:[{
        i:inew,
        b:structuredClone(b)
      }]
    }
}


const go_from_to = (transforms, i, b, inew, direction) => {
  const bo = structuredClone(b)
  bo.direction = direction
  transforms.push( {
    inputs: [
      {
        i:i,
        b:structuredClone(b),
      }
    ],
    outputs:[
      {
        i:inew,
        b:bo,
      }
    ],
  })
}


const go_from_to_2 = (transforms, b, i, b_source, direction, i_dest) => {
    const bo = structuredClone(b_source)
    bo.direction = direction
    bo.k = Kind.pixel
    transforms.push( 
        {
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                },
                
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                },
                {
                    i:i_dest,
                    b:bo,
                }
            ],
        }
    )
}



const go_from_to_3 = (transforms, b, i, b_source, direction, i_dest) => {
    const bo = structuredClone(b_source)
    bo.direction = direction
    bo.k = Kind.pixel
    bo.r = bo.r / 2
    bo.g = bo.g / 2
    bo.b = bo.b / 2
    if (bo.r < 128) bo.r = 0;
    if (bo.g < 128) bo.g = 0;
    if (bo.b < 128) bo.b = 0;
    transforms.push( 
        {
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                },
                
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                },
                {
                    i:i_dest,
                    b:bo,
                }
            ],
        }
    )
}


const consume = (transforms, score, i, b, flow_rate, tick) => {
    const rgb = `${b.r},${b.g},${b.b}`
    score[rgb] += 1
    flow_rate[tick][rgb] += 1
    transforms.push(
        {
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                    scoring: rgb,
                }
            ],
            outputs:[],
        }
    )
}


const add_transforms = (x, y, world, transforms, score, flow_rate) => {
    // Setups indexes
    const i = x + y * world.unit_count
    const id = down(i, world.unit_count)
    const il = left(i, world.unit_count)
    const ir = right(i, world.unit_count)
    const iu = up(i, world.unit_count)
    // Setup blocks
    const b = world.blocks[i]
    const br = world.blocks[ir]
    const bd = world.blocks[id]
    const bl = world.blocks[il]
    const bu = world.blocks[iu]
    // 
    const conditions_actions = [
        [
            b.k == Kind.pixel
            && (
                ( bl.k == Kind.consume && b.direction == Direction.left)
                || ( br.k == Kind.consume && b.direction == Direction.right)
                || ( bu.k == Kind.consume && b.direction == Direction.up)
                || ( bd.k == Kind.consume && b.direction == Direction.down)
            )
            ,consume
            ,[transforms, score, i, b, flow_rate, world.tick/9]
        ], 
        [
            br.k == Kind.down && b.direction == Direction.right  
            || bl.k == Kind.down && b.direction == Direction.left  
            , go_from_to
            , [transforms, i, b, id, Direction.down]
        ],
        [
            br.k == Kind.up && b.direction == Direction.right  
            || bl.k == Kind.up && b.direction == Direction.left  
            , go_from_to
            , [transforms, i, b, id, Direction.up]
        ],
        [
            br.k == Kind.left && b.direction == Direction.up  
            || bl.k == Kind.left && b.direction == Direction.down  
            , go_from_to
            , [transforms, i, b, id, Direction.left]
        ],
        [
            br.k == Kind.right && b.direction == Direction.up  
            || bl.k == Kind.right && b.direction == Direction.down  
            , go_from_to
            , [transforms, i, b, id, Direction.right]
        ],
        [
            bd.k == Kind.create && b.k == Kind.d2u
            , go_from_to_2
            , [transforms, b, i, bd, Direction.up, iu]
        ],
        [
            br.k == Kind.create && b.k == Kind.r2l
            , go_from_to_2
            , [transforms, b, i, br, Direction.left, il]
        ],
        [
            bl.k == Kind.create && b.k == Kind.l2r
            , go_from_to_2
            , [transforms, b, i, bl, Direction.right, ir]
        ],
        [
            br.k == Kind.create && b.k == Kind.r1l
            , go_from_to_3
            , [transforms, b, i, br, Direction.left, il]
        ],
        [
            bu.k == Kind.create && b.k == Kind.u1d
            , go_from_to_3
            , [transforms, b, i, bu, Direction.down, id]
        ],
    ]
    let conditions_actions_used = false;
    for (const condition_action of conditions_actions) {
        const condition = condition_action[0]
        const action = condition_action[1]
        const args = condition_action[2]
        if (condition) {
            action(...args)
            conditions_actions_used = true
            break
        }
    }


    if (conditions_actions_used) {
        // pass
    }
    else if (b.k == Kind.pixel) {
        // 
        // Split
        //
        if (
            bd.k == Kind.split_left_right
            || bu.k == Kind.split_left_right
        ) {
            transforms.push(
                {
                    inputs: [
                        {
                        i:i,
                        b:structuredClone(b),
                        }
                    ],
                    outputs:[
                        {
                        i: il,
                        b: {
                            k: Kind.pixel,
                            r: b.r / 2,
                            g: b.g / 2,
                            b: b.b / 2,
                            direction: Direction.left,
                        }
                        }, {
                        i: ir,
                        b: {
                            k: Kind.pixel,
                            r: b.r / 2,
                            g: b.g / 2,
                            b: b.b / 2,
                            direction: Direction.right,
                        }
                        }
                    ],
                }
            )
        }
        
        else if (
            (
            br.k == Kind.split_up_down
            || bl.k == Kind.split_up_down
            ) && (b.r > limit || !b.r) && (b.g > limit || !b.g) && (b.b > limit || !b.b)
        ) {
            transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }
            ],
            outputs:[
                {
                i: iu,
                b: {
                    k: Kind.pixel,
                    r: b.r / 2,
                    g: b.g / 2,
                    b: b.b / 2,
                    direction: Direction.up,
                }
                }, {
                i: id,
                b: {
                    k: Kind.pixel,
                    r: b.r / 2,
                    g: b.g / 2,
                    b: b.b / 2,
                    direction: Direction.down,
                }
                }
            ],
            })
        }  
        // 
        // Continue movement (or static)
        // 
        else if (
            b.direction == Direction.down 
            && (
                bd.k ==  Kind.void
                || bd.k ==  Kind.pixel
            )
        ) {
            transforms.push(continue_from_to(i, b, id))
        }
        else if (
            b.direction == Direction.right 
            && (
                br.k ==  Kind.void
                || br.k ==  Kind.pixel
            )
        ) {
            transforms.push(continue_from_to(i, b, ir))
        }
        else if (
            b.direction == Direction.left 
            && (
                bl.k ==  Kind.void
                || bl.k ==  Kind.pixel
            )
        ) {
            transforms.push(continue_from_to(i, b, il))
        }
        else if (
            b.direction == Direction.up
            && (
                bu.k ==  Kind.void
                || bu.k ==  Kind.pixel
            )
        ) {
            transforms.push(continue_from_to(i, b, iu))
        } 
        else {
            transforms.push(continue_from_to(i, b, i))
        }
    // 
    // Mixers
    // 
    } else if (
        b.k == Kind.ld2r
        && bl.k == Kind.pixel 
        && bd.k == Kind.pixel
    ) {
        transforms.push({
            inputs: [
            {
                i:i,
                b:structuredClone(b),
            }, {
                i:il,
                b:structuredClone(bl),
            }, {
                i:id,
                b:structuredClone(bd),
            }
            ],
            outputs:[
            {
                i:i,
                b:structuredClone(b),
            }, {
                i: ir,
                b: {
                    k: Kind.pixel,
                    r: bl.r + bd.r,
                    g: bl.g + bd.g,
                    b: bl.b + bd.b,
                    direction: Direction.right,
                }
            }
            ],
            deletes: [
                {
                    i:il,
                },
                {
                    i:id,
                },
            ]
        })
    } else if (
        b.k == Kind.mix_to_left
        && bu.k == Kind.pixel 
        && bd.k == Kind.pixel
    ) {
        transforms.push({
            inputs: [
            {
                i:i,
                b:structuredClone(b),
            }, {
                i:iu,
                b:structuredClone(bu),
            }, {
                i:id,
                b:structuredClone(bd),
            }
            ],
            outputs:[
            {
                i:i,
                b:structuredClone(b),
            }, {
                i: il,
                b: {
                k: Kind.pixel,
                r: bu.r + bd.r,
                g: bu.g + bd.g,
                b: bu.b + bd.b,
                direction: Direction.left,
                }
            }
            ],
            deletes: [
                {
                    i:iu,
                },
                {
                    i:id,
                },
            ]
        })
    } 
    //
    // Create
    //
    else if (
        b.k == Kind.create 
        && (br.k == Kind.up || bl.k == Kind.up)
    ) {
        transforms.push({
            inputs: [
            {
                i:i,
                b:structuredClone(b),
            }, 
            // {
            //   i:iu,
            //   b:structuredClone(bu),
            // }, {
            //   i:id,
            //   b:structuredClone(bd),
            // }
            ],
            outputs:[
            {
                i:i,
                b:structuredClone(b),
            }, 
            {
                i: iu,
                b: {
                k: Kind.pixel,
                r: b.r,
                g: b.g,
                b: b.b,
                direction: Direction.up,
                },
            },
            ],
            // deletes: [
            //   {
            //     i:iu,
            //   },
            //   {
            //     i:id,
            //   },
            // ]
        })
    }
    //
    else if (
        b.k == Kind.d2l
        && bd.k == Kind.pixel
        && bd.direction == Direction.up
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }, 
                {
                    i: il,
                    b: {
                        k: Kind.pixel,
                        r: bd.r,
                        g: bd.g,
                        b: bd.b,
                        direction: Direction.left,
                    },
                },
            ],
            deletes: [
                {
                    i:id,
                },
            ]
        })
    }
    else if (
        b.k == Kind.d2r
        && bd.k == Kind.pixel
        && bd.direction == Direction.up
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }, 
                {
                    i: ir,
                    b: {
                        k: Kind.pixel,
                        r: bd.r,
                        g: bd.g,
                        b: bd.b,
                        direction: Direction.right,
                    },
                },
            ],
            deletes: [
                {
                    i:id,
                },
            ]
        })
    }



    else if (
        b.k == Kind.r2u
        && br.k == Kind.pixel
        && br.direction == Direction.left
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }, 
                {
                    i: iu,
                    b: {
                        k: Kind.pixel,
                        r: br.r,
                        g: br.g,
                        b: br.b,
                        direction: Direction.up,
                    },
                },
            ],
            deletes: [
                {
                    i:ir,
                },
            ]
        })
    }
    else if (
        b.k == Kind.l2u
        && bl.k == Kind.pixel
        && bl.direction == Direction.right
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }, 
                {
                    i: iu,
                    b: {
                        k: Kind.pixel,
                        r: bl.r,
                        g: bl.g,
                        b: bl.b,
                        direction: Direction.up,
                    },
                },
            ],
            deletes: [
                {
                    i:il,
                },
            ]
        })
    }
    else if (
        b.k == Kind.l2d
        && bl.k == Kind.pixel
        && bl.direction == Direction.right
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }, 
                {
                    i: id,
                    b: {
                        k: Kind.pixel,
                        r: bl.r,
                        g: bl.g,
                        b: bl.b,
                        direction: Direction.down,
                    },
                },
            ],
            deletes: [
                {
                    i:il,
                },
            ]
        })
    }
    

    else if (
        b.k == Kind.d2lr
        && bd.k == Kind.pixel
        && bd.direction == Direction.up
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:{
                        k: Kind.d2lr
                    },
                }, 
                {
                    i: il,
                    b: {
                        k: Kind.pixel,
                        r: bd.r/2,
                        g: bd.g/2,
                        b: bd.b/2,
                        direction: Direction.left,
                    },
                },
                {
                    i: ir,
                    b: {
                        k: Kind.pixel,
                        r: bd.r/2,
                        g: bd.g/2,
                        b: bd.b/2,
                        direction: Direction.right,
                    },
                },
            ],
            deletes: [
                {
                    i:id,
                },
            ]
        })
    }

    else if (
        b.k == Kind.d2l_
        && bd.k == Kind.pixel
        && bd.direction == Direction.up
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:{
                        k: Kind.d2r_
                    },
                }, 
                {
                    i: il,
                    b: {
                        k: Kind.pixel,
                        r: bd.r,
                        g: bd.g,
                        b: bd.b,
                        direction: Direction.left,
                    },
                },
            ],
            deletes: [
                {
                    i:id,
                },
            ]
        })
    }

    else if (
        b.k == Kind.d2r_
        && bd.k == Kind.pixel
        && bd.direction == Direction.up
    ) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }, 
            ],
            outputs:[
                {
                    i:i,
                    b:{
                        k: Kind.d2l_
                    },
                }, 
                {
                    i: ir,
                    b: {
                        k: Kind.pixel,
                        r: bd.r,
                        g: bd.g,
                        b: bd.b,
                        direction: Direction.right,
                    },
                },
            ],
            deletes: [
                {
                    i:id,
                },
            ]
        })
    }

    //
    // Default
    //
    else if (b.k != Kind.void) {
        transforms.push({
            inputs: [
                {
                    i:i,
                    b:structuredClone(b),
                }
            ],
            outputs:[
                {
                    i:i,
                    b:structuredClone(b),
                }
            ]
        })
    } 
    else if (b.k == Kind.void) {
        // pass
    } else {
        throw `error: ${b.k}`
    }
}

export {
    add_transforms,
}
