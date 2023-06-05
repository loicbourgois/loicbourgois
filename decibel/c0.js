const lines = [
    // 'x--- x--- x-x- ----',
    'x--- ---- --x- ---- x--- ---x --x- ----',
    '---- x--- ---- x--- ---- x--- ---- x---',
]
const c0 = {
    "s1": {
        "kind": "stereo",
        "pan": 0,
        "destinations": [
            "AUDIO_CONTEXT"
        ],
        "top": 0,
        "right": 0
    },
    "g1": {
        "kind": "gain",
        "gain": 0,
        "destinations": [
            "s1"
        ],
        "top": 0,
        "right": 1
    },
    
    "g6": {
        "kind": "gain",
        "gain": 0,
        "destinations": [
            "low6"
        ],
        "top": 0,
        "right": 4
    },
    "g6_2": {
        "kind": "gain",
        "gain": 220,
        "destinations": [
            "osc6.f"
        ],
        "top": 1,
        "right": 5
    },
    "osc6": {
        "kind": "osc",
        "destinations": [
            "g6"
        ],
        "frequency": 10,
        "detune": 0,
        "top": 1,
        "right": 4
    },
    "low6": {
        "kind": "lowpass",
        "destinations": [
            "low62"
        ],
        "frequency": 42,
        "peak": 16,
        "top": 0,
        "right": 3
    },
    "low62": {
        "kind": "lowpass",
        "destinations": [
            "g1",
            "low62_fg",
        ],
        "frequency": 200,
        "peak": 10,
        "top": 0,
        "right": 2
    },

    "low62_fg": {
        "kind": "frequency_graph",
        "bars": 2048,
        "zoom": 32,
        "top": 1,
        "right": 2
    },


    "const_1": {
        "kind": "const",
        "top": 4,
        "right": 5,
        "destinations": [
            "const_1_og",
            "add_1",
        ]
    },
    "const_1_og": {
        "kind": "osc_graph",
        "top": 4,
        "right": 4
    },


    "const_2": {
        "kind": "const",
        "top": 5,
        "right": 5,
        "destinations": [
            "const_2_og",
            "add_1",
        ]
    },
    "const_2_og": {
        "kind": "osc_graph",
        "top": 5,
        "right": 4
    },


    "add_1": {
        "kind": "add",
        "top": 5,
        "right": 3,
        "destinations": [
            "add_1_og"
        ]
    },
    "add_1_og": {
        "kind": "osc_graph",
        "top": 5,
        "right": 2
    },


    "clock": {
        "kind": "clock",
        "top": 7,
        "right": 3,
        "bpm": 60*2,
        "destinations": [
            "clock_og",
        ]
    },
    "clock_og": {
        "kind": "osc_graph",
        "top": 7,
        "right": 4,
    },


    "asdr": {
        "kind": "asdr",
        "top": 0,
        "right": 5,
        "destinations": [
            "g6.g",
            "g6_2",
        ]
    },
    "asdr_og": {
        "kind": "osc_graph",
        "top": 6,
        "right": 2,
    },

    "bl1": {
        "kind": "beat_line",
        "top": 0,
        "right": 7,
        "line": lines[0],
        "bpm": 174/2,
        "beats": 8,
        "destinations": [
            "bl1_og",
            "asdr",
        ]
    },
    "bl1_og": {
        "kind": "osc_graph",
        "top": 0,
        "right": 6,
    },


    "bl2": {
        "kind": "beat_line",
        "top": 0.25,
        "right": 7,
        "line": lines[1],
        "destinations": [
            "bl2_og",
            "2_asdr",
        ],
        "bpm": 174/2,
        "beats": 8,
    },
    "bl2_og": {
        "kind": "osc_graph",
        "top": 2,
        "right": 6,
    },
    "2_asdr": {
        "kind": "asdr",
        "top": 2,
        "right": 5,
        "destinations": [
            "2_g.g",
            "2_g2",
        ]
    },
    "2_asdr_og": {
        "kind": "osc_graph",
        "top": 4,
        "right": 2,
    },
    "2_g": {
        "kind": "gain",
        "gain": 0,
        "destinations": [
            "2_low"
        ],
        "top": 2,
        "right": 4
    },
    "2_g2": {
        "kind": "gain",
        "gain": 220,
        "destinations": [
            "2_osc.f"
        ],
        "top": 3,
        "right": 5
    },


    "2_low": {
        "kind": "lowpass",
        "destinations": [
            "2_low2"
        ],
        "frequency": 42,
        "peak": 16,
        "top": 2,
        "right": 3
    },
    "2_osc": {
        "kind": "osc",
        "destinations": [
            "2_g"
        ],
        "frequency": 100,
        "detune": 0,
        "top": 3,
        "right": 4
    },
    // "2_g": {
    //     "kind": "lowpass",
    //     "destinations": [
    //         "2_g2"
    //     ],
    //     "frequency": 42,
    //     "peak": 16,
    //     "top": 2,
    //     "right": 3
    // },
    "2_low2": {
        "kind": "lowpass",
        "destinations": [
            "2_gf",
            "2_fg",
        ],
        "frequency": 200,
        "peak": 10,
        "top": 2,
        "right": 2
    },
    "2_gf": {
        "kind": "gain",
        "gain": 0,
        "destinations": [
            "s1"
        ],
        "top": 2,
        "right": 1
    },
    "2_fg": {
        "kind": "frequency_graph",
        "bars": 2048,
        "zoom": 32,
        "top": 3,
        "right": 2
    },
}


export {
    c0,
}
