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
    "fg1": {
        "kind": "frequency_graph",
        "bars": 100,
        "top": 1,
        "right": 1
    },
    "fg2": {
        "kind": "frequency_graph",
        "bars": 100,
        "top": 2,
        "right": 1
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
    "osc1": {
        "kind": "osc",
        "destinations": [
            "low1",
            "fg2"
        ],
        "frequency": 200,
        "detune": 0,
        "top": 1,
        "right": 2
    },
    "low1": {
        "kind": "lowpass",
        "destinations": [
            "g1",
            "fg1"
        ],
        "frequency": 120,
        "peak": 0,
        "top": 0,
        "right": 2
    },
    "g2": {
        "kind": "gain",
        "gain": 100,
        "destinations": [
            "osc1.f"
        ],
        "top": 0,
        "right": 3
    },
    "osc2": {
        "kind": "osc",
        "destinations": [
            "g2"
        ],
        "frequency": 100,
        "detune": 0,
        "top": 0,
        "right": 4
    },
    "osc3": {
        "kind": "osc",
        "destinations": [
            "g2"
        ],
        "frequency": 1000,
        "detune": 0,
        "top": 1,
        "right": 4
    },
    "g4": {
        "kind": "gain",
        "gain": 1000,
        "destinations": [
            "osc3.frequency"
        ],
        "top": 1,
        "right": 5
    },
    "osc4": {
        "kind": "osc",
        "destinations": [
            "g4"
        ],
        "frequency": 4,
        "detune": 0,
        "top": 1,
        "right": 6
    }
}

export {
    c0,
}