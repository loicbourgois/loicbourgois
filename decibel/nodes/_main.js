import { dcbl_add } from "./add.js"
import { dcbl_clock } from "./clock.js"
import { dcbl_const } from "./const.js"
import { dcbl_asdr } from "./asdr.js"
import { dcbl_beat_line } from "./beat_line.js"


const nodes = {
    'add': dcbl_add,
    'clock': dcbl_clock,
    'const': dcbl_const,
    'asdr': dcbl_asdr,
    'beat_line': dcbl_beat_line,
}


export {
    nodes,
}