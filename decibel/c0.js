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
    "cosc1": {
        "kind": "custom_osc",
        "top": 0,
        "right": 5,
        "destinations": [
            "cosc1_fg",
            "cosc1_og",
            "g6.g",
            "g6_2"
        ],
        "frequency": 0.5
    },
    "cosc1_fg": {
        "kind": "frequency_graph",
        "bars": 2048,
        "zoom": 8,
        "top": 0,
        "right": 6
    },
    "cosc1_og": {
        "kind": "osc_graph",
        "top": 1,
        "right": 6
    },
    "osc6": {
        "kind": "osc",
        "destinations": [
            "g6"
        ],
        "frequency": 0,
        "detune": 0,
        "top": 1,
        "right": 4
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
        "gain": 500,
        "destinations": [
            "osc6.f"
        ],
        "top": 1,
        "right": 5
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
            "s1"
        ],
        "frequency": 200,
        "peak": 10,
        "top": 0,
        "right": 2
    }
}

export {
    c0,
}