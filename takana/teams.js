import * as action from './decision_making/action.js'
import * as condition from './decision_making/condition.js'
import * as target from './decision_making/target.js'
const get_teams = () => {
    return [
        {
            side: "left",
            members:[
                {
                    full_name: "Ampelius Seti",
                    max_life: 100,
                    max_mana: 100,
                    position: {
                        x: 0.0,
                        y: 0.5,
                    },
                    size: 0.1,
                    strength: 20,
                    magic: 20,
                    // dead: true,
                    decision_makers: [
                        {
                            conditions: [condition.ally_health_less_than_50],
                            action: action.heal,
                            target: target.ally_lowest_health,
                        },
                        // {
                        //     conditions: [condition.self_mana_less_than_10],
                        //     action: action.meditate,
                        //     target: target.self,
                        // }, 
                        {
                            conditions: [],
                            action: action.attack,
                            target: target.ennemy,
                        }
                    ],
                },
                {
                    full_name: "Lindiwe Adrià",
                    max_life: 100,
                    max_mana: 100,
                    position: {
                        x: -0.5,
                        y: -0.5,
                    },
                    size: 0.1,
                    strength: 20,
                    magic: 20,
                    decision_makers: [
                        {
                            conditions: [condition.ally_health_less_than_50],
                            action: action.heal,
                            target: target.ally_lowest_health,
                        },
                        // {
                        //     conditions: [condition.self_mana_less_than_10],
                        //     action: action.meditate,
                        //     target: target.self,
                        // }, 
                        {
                            conditions: [],
                            action: action.attack,
                            target: target.ennemy,
                        }
                    ],
                },
                {
                    full_name: "Batraz Bolesław",
                    max_life: 100,
                    max_mana: 100,
                    position: {
                        x: 0.5,
                        y: -0.5,
                    },
                    size: 0.1,
                    strength: 20,
                    magic: 20,
                    decision_makers: [
                        {
                            conditions: [],
                            action: action.attack,
                            target: target.ennemy,
                        }
                    ],
                }
            ],
        },
        {
            side: "right",
            members: [
                {
                    full_name: "Yaxkin",
                    max_life: 1000,
                    max_mana: 2000,
                    position: {
                        x: 0.0,
                        y: 0.0,
                    },
                    size: 0.3,
                    strength: 30,
                    magic: 30,
                    decision_makers: [
                        {
                            conditions: [condition.ally_health_less_than_50],
                            action: action.heal,
                            target: target.ally_lowest_health,
                        },
                        // {
                        //     conditions: [condition.self_mana_less_than_10],
                        //     action: action.meditate,
                        //     target: target.self,
                        // }, 
                        {
                            conditions: [],
                            action: action.attack,
                            target: target.ennemy,
                        }
                    ],
                }
            ]
        }
    ]
}
export {
    get_teams,
}