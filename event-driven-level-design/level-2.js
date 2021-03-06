const level_2 = {
  "max_time_ms": 150000,
  "step_interval_ms": 1,
  "event_count_down_ms": 50,
  "render_interval_ms": 20,
  "line_width": 0.5,
  "small_line_width": 0.05,
  "point_per_trajectory": 10,
  "world": {
    "border_size": 1,
    "gravity": -4,
    "time": 0,
    "width": 18.180913000000004,
    "height": 18.180913000000004
  },
  "wall": {
    "height": 1
  },
  "player": {
    "height": 0.5,
    "width": 0.4,
    "jump_impulse": 4.5,
    "position": {
      "x": 0,
      "y": 0
    }
  },
  "starting_direction": {
    "x": -1,
    "y": 1
  },
  "speed": {
    "value": 2,
    "unit": "unit per second"
  },
  "colors": {
    "border": "#a00",
    "trajectory": "#0aa",
    "platform": "#44F",
    "wall": "#44F",
    "background": "rgba(0.1, 0.1, 0, 1)",
    "background_game": "rgba(1, 1, 0.9, 0.04)",
    "player": "#06f",
    "player_side": "#0ff",
    "surface": "#fa0"
  },
  "events": [
    {
      "name": "start",
      "time": 0,
      "delta": 0
    },
    {
      "name": "jump",
      "time": 1.659,
      "delta": 1.659
    },
    {
      "name": "jump",
      "time": 2.194,
      "delta": 0.5349999999999999
    },
    {
      "name": "ground",
      "time": 3.173,
      "delta": 0.9790000000000001
    },
    {
      "name": "jump",
      "time": 3.96,
      "delta": 0.7869999999999999
    },
    {
      "name": "jump",
      "time": 4.493,
      "delta": 0.5330000000000004
    },
    {
      "name": "ground",
      "time": 5.109,
      "delta": 0.6159999999999997
    },
    {
      "name": "jump",
      "time": 5.962,
      "delta": 0.8529999999999998
    },
    {
      "name": "jump",
      "time": 6.552,
      "delta": 0.5899999999999999
    },
    {
      "name": "ground",
      "time": 7.027,
      "delta": 0.47500000000000053
    },
    {
      "name": "jump",
      "time": 7.894,
      "delta": 0.867
    },
    {
      "name": "jump",
      "time": 8.521,
      "delta": 0.6270000000000007
    },
    {
      "name": "ground",
      "time": 9.063,
      "delta": 0.5419999999999998
    },
    {
      "name": "jump",
      "time": 9.912,
      "delta": 0.8490000000000002
    },
    {
      "name": "ground",
      "time": 10.427,
      "delta": 0.5149999999999988
    },
    {
      "name": "jump",
      "time": 10.888,
      "delta": 0.4610000000000003
    },
    {
      "name": "jump",
      "time": 11.28,
      "delta": 0.39199999999999946
    },
    {
      "name": "ground",
      "time": 11.823,
      "delta": 0.543000000000001
    },
    {
      "name": "jump",
      "time": 13.154,
      "delta": 1.3309999999999995
    },
    {
      "name": "ground",
      "time": 15.329,
      "delta": 2.1750000000000007
    },
    {
      "name": "jump",
      "time": 17.015,
      "delta": 1.686
    },
    {
      "name": "ground",
      "time": 18.227,
      "delta": 1.2119999999999997
    },
    {
      "name": "jump",
      "time": 18.696,
      "delta": 0.4690000000000012
    },
    {
      "name": "jump",
      "time": 18.914,
      "delta": 0.21799999999999997
    },
    {
      "name": "ground",
      "time": 20.841,
      "delta": 1.9269999999999996
    },
    {
      "name": "jump",
      "time": 22.082,
      "delta": 1.2409999999999997
    },
    {
      "name": "ground",
      "time": 22.771,
      "delta": 0.6890000000000001
    },
    {
      "name": "jump",
      "time": 23.343,
      "delta": 0.5719999999999992
    },
    {
      "name": "stop",
      "time": 23.989,
      "delta": 0.6460000000000008
    }
  ],
  "trajectories": [
    {
      "start": 0,
      "stop": 1.659,
      "formulas": {
        "x": "0 + (t-0) * 2 * -1",
        "y": "0"
      },
      "type": "linear"
    },
    {
      "start": 1.659,
      "stop": 2.194,
      "type": "jump",
      "formulas": {
        "x": "-3.318 + (t-1.659) * 2 * -1",
        "y": "t_ = (t-1.659); 0 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 2.194,
      "stop": 3.173,
      "type": "wall-jump",
      "formulas": {
        "x": "-4.388 + (t-2.194) * 2 * 1",
        "y": "t_ = (t-2.194); 1.2626000000000002 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 3.173,
      "stop": 3.96,
      "formulas": {
        "x": "-2.4299999999999997 + (t-3.173) * 2 * 1",
        "y": "1.8343359999999995"
      },
      "type": "linear"
    },
    {
      "start": 3.96,
      "stop": 4.493,
      "type": "jump",
      "formulas": {
        "x": "-0.8559999999999999 + (t-3.96) * 2 * 1",
        "y": "t_ = (t-3.96); 1.8343359999999995 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 4.493,
      "stop": 5.109,
      "type": "wall-jump",
      "formulas": {
        "x": "0.21000000000000085 + (t-4.493) * 2 * -1",
        "y": "t_ = (t-4.493); 3.0964799999999997 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 5.109,
      "stop": 5.962,
      "formulas": {
        "x": "-1.0219999999999985 + (t-5.109) * 2 * -1",
        "y": "4.350656"
      },
      "type": "linear"
    },
    {
      "start": 5.962,
      "stop": 6.552,
      "type": "jump",
      "formulas": {
        "x": "-2.727999999999998 + (t-5.962) * 2 * -1",
        "y": "t_ = (t-5.962); 4.350656 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 6.552,
      "stop": 7.027,
      "type": "wall-jump",
      "formulas": {
        "x": "-3.9079999999999977 + (t-6.552) * 2 * 1",
        "y": "t_ = (t-6.552); 5.613256 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 7.027,
      "stop": 7.894,
      "formulas": {
        "x": "-2.9579999999999966 + (t-7.027) * 2 * 1",
        "y": "6.848256000000001"
      },
      "type": "linear"
    },
    {
      "start": 7.894,
      "stop": 8.521,
      "type": "jump",
      "formulas": {
        "x": "-1.2239999999999966 + (t-7.894) * 2 * 1",
        "y": "t_ = (t-7.894); 6.848256000000001 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 8.521,
      "stop": 9.063,
      "type": "wall-jump",
      "formulas": {
        "x": "0.03000000000000469 + (t-8.521) * 2 * -1",
        "y": "t_ = (t-8.521); 8.09724 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 9.063,
      "stop": 9.912,
      "formulas": {
        "x": "-1.053999999999995 + (t-9.063) * 2 * -1",
        "y": "9.361183999999998"
      },
      "type": "linear"
    },
    {
      "start": 9.912,
      "stop": 10.427,
      "type": "jump",
      "formulas": {
        "x": "-2.7519999999999953 + (t-9.912) * 2 * -1",
        "y": "t_ = (t-9.912); 9.361183999999998 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 10.427,
      "stop": 10.888,
      "formulas": {
        "x": "-3.781999999999993 + (t-10.427) * 2 * -1",
        "y": "10.617783999999997"
      },
      "type": "linear"
    },
    {
      "start": 10.888,
      "stop": 11.28,
      "type": "jump",
      "formulas": {
        "x": "-4.7039999999999935 + (t-10.888) * 2 * -1",
        "y": "t_ = (t-10.888); 10.617783999999997 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 11.28,
      "stop": 11.823,
      "type": "wall-jump",
      "formulas": {
        "x": "-5.487999999999992 + (t-11.28) * 2 * 1",
        "y": "t_ = (t-11.28); 11.767127999999996 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 11.823,
      "stop": 13.154,
      "formulas": {
        "x": "-4.40199999999999 + (t-11.823) * 2 * 1",
        "y": "13.031231999999996"
      },
      "type": "linear"
    },
    {
      "start": 13.154,
      "stop": 15.329,
      "type": "jump",
      "formulas": {
        "x": "-1.7399999999999913 + (t-13.154) * 2 * 1",
        "y": "t_ = (t-13.154); 13.031231999999996 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 15.329,
      "stop": 17.015,
      "formulas": {
        "x": "2.61000000000001 + (t-15.329) * 2 * 1",
        "y": "3.8962319999999853"
      },
      "type": "linear"
    },
    {
      "start": 17.015,
      "stop": 18.227,
      "type": "jump",
      "formulas": {
        "x": "5.98200000000001 + (t-17.015) * 2 * 1",
        "y": "t_ = (t-17.015); 3.8962319999999853 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 18.227,
      "stop": 18.696,
      "formulas": {
        "x": "8.40600000000001 + (t-18.227) * 2 * 1",
        "y": "3.4744559999999867"
      },
      "type": "linear"
    },
    {
      "start": 18.696,
      "stop": 18.914,
      "type": "jump",
      "formulas": {
        "x": "9.344000000000012 + (t-18.696) * 2 * 1",
        "y": "t_ = (t-18.696); 3.4744559999999867 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": 1
      }
    },
    {
      "start": 18.914,
      "stop": 20.841,
      "type": "wall-jump",
      "formulas": {
        "x": "9.780000000000012 + (t-18.914) * 2 * -1",
        "y": "t_ = (t-18.914); 4.265359999999987 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 20.841,
      "stop": 22.082,
      "formulas": {
        "x": "5.926000000000013 + (t-20.841) * 2 * -1",
        "y": "-1.916456000000009"
      },
      "type": "linear"
    },
    {
      "start": 22.082,
      "stop": 22.771,
      "type": "jump",
      "formulas": {
        "x": "3.4440000000000133 + (t-22.082) * 2 * -1",
        "y": "t_ = (t-22.082); -1.916456000000009 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    },
    {
      "start": 22.771,
      "stop": 23.343,
      "formulas": {
        "x": "2.066000000000013 + (t-22.771) * 2 * -1",
        "y": "-0.714840000000009"
      },
      "type": "linear"
    },
    {
      "start": 23.343,
      "stop": 23.989,
      "type": "jump",
      "formulas": {
        "x": "0.9220000000000148 + (t-23.343) * 2 * -1",
        "y": "t_ = (t-23.343); -0.714840000000009 +  t_ * t_ * -4 + t_ * 4.5 "
      },
      "direction": {
        "x": -1
      }
    }
  ],
  "translate": {
    "x": 6.487999999999992,
    "y": 2.916456000000009
  },
  "surfaces": [
    {
      "x1": 0,
      "y1": -0.25,
      "x2": -3.318,
      "y2": -0.25
    },
    {
      "x1": -4.588,
      "y1": 0.7626000000000002,
      "x2": -4.588,
      "y2": 1.7626000000000002
    },
    {
      "x1": -2.4299999999999997,
      "y1": 1.5843359999999995,
      "x2": -0.8559999999999999,
      "y2": 1.5843359999999995
    },
    {
      "x1": 0.41000000000000086,
      "y1": 2.5964799999999997,
      "x2": 0.41000000000000086,
      "y2": 3.5964799999999997
    },
    {
      "x1": -1.0219999999999985,
      "y1": 4.100656,
      "x2": -2.727999999999998,
      "y2": 4.100656
    },
    {
      "x1": -4.107999999999998,
      "y1": 5.113256,
      "x2": -4.107999999999998,
      "y2": 6.113256
    },
    {
      "x1": -2.9579999999999966,
      "y1": 6.598256000000001,
      "x2": -1.2239999999999966,
      "y2": 6.598256000000001
    },
    {
      "x1": 0.2300000000000047,
      "y1": 7.597239999999999,
      "x2": 0.2300000000000047,
      "y2": 8.59724
    },
    {
      "x1": -1.053999999999995,
      "y1": 9.111183999999998,
      "x2": -2.7519999999999953,
      "y2": 9.111183999999998
    },
    {
      "x1": -3.781999999999993,
      "y1": 10.367783999999997,
      "x2": -4.7039999999999935,
      "y2": 10.367783999999997
    },
    {
      "x1": -5.687999999999993,
      "y1": 11.267127999999996,
      "x2": -5.687999999999993,
      "y2": 12.267127999999996
    },
    {
      "x1": -4.40199999999999,
      "y1": 12.781231999999996,
      "x2": -1.7399999999999913,
      "y2": 12.781231999999996
    },
    {
      "x1": 2.61000000000001,
      "y1": 3.6462319999999853,
      "x2": 5.98200000000001,
      "y2": 3.6462319999999853
    },
    {
      "x1": 8.40600000000001,
      "y1": 3.2244559999999867,
      "x2": 9.344000000000012,
      "y2": 3.2244559999999867
    },
    {
      "x1": 9.980000000000011,
      "y1": 3.765359999999987,
      "x2": 9.980000000000011,
      "y2": 4.765359999999987
    },
    {
      "x1": 5.926000000000013,
      "y1": -2.166456000000009,
      "x2": 3.4440000000000133,
      "y2": -2.166456000000009
    },
    {
      "x1": 2.066000000000013,
      "y1": -0.964840000000009,
      "x2": 0.9220000000000148,
      "y2": -0.964840000000009
    }
  ],
  "mins": {
    "x": -6.487999999999992,
    "y": -2.916456000000009
  }
}
