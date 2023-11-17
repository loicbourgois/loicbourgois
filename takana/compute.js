import * as action from './decision_making/action.js'
import * as target from './decision_making/target.js'
const clock_frequency = 120
const make_decision = (teams, member) => {
    for (const maker of member.decision_makers) {
        let ok = true
        for (const condition of maker.conditions) {
            if (
                (! condition.function(teams, member.mid))
                || maker.action.mana_need > member.mana
            ) {
                ok = false
                break
            }
        }
        if (ok) {
            return {
                action: maker.action,
                target: maker.target,
            }
        }
    }
    return {
        action: action.wait,
        target: target.self,
    }
}
const get_max_timer = (action) => {
    return action.max_timer * clock_frequency
}
const compute = (teams) => {
    for (const team of teams) {
        for (const member of team.members) {
            if (member.dead) {
                continue
            }
            const decision = make_decision(teams, member)
            if (!member.decision || member.decision.action.label != decision.action.label) {
                member.decision = decision
                member.max_timer = get_max_timer(member.decision.action)
            }
        }
    }
    for (const team of teams) {
        for (const member of team.members) {
            if (member.dead) {
                continue
            }
            if (member.timer) {
                member.timer = Math.min(member.max_timer, Math.max(0, member.timer-1))
            } else {
                member.timer = member.max_timer
            }
            if (member.timer <= 0) {
                const target = member.decision.target.function(teams, member.mid)
                if (target) {
                    member.decision.action.function(
                        teams,
                        member.mid,
                        target,
                        member.decision.action,
                    )
                }
                reset_decision(member)
            }
        }
    }
    for (const team of teams) {
        for (const member of team.members) {
            if (member.life <= 0) {
                member.dead = true
                reset_decision(member)
            }
        }
    }
}
const reset_decision = (member) => {
    member.decision = null
    member.max_timer = null
    member.timer = null   
}
export {
    compute,
}