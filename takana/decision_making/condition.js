import {
    get_member,
    get_team,
} from '../member.js'
import {
    remaining_mana_percent,
    remaining_life_percent,
} from '../member.js'
const ally_health_less_than_50 = {
    label: "Ally health < 50%",
    function: (teams, mid) => {
        const team = get_team(teams, mid)
        for (const member of team.members) {
            if (remaining_life_percent(member) < 0.5 && !member.dead) {
                return true
            }
        }
        return false
    }
}
const self_mana_less_than_10 = {
    label: "Self mana < 10%",
    function: (teams, mid) => {
        const self = get_member(teams, mid)
        return remaining_mana_percent(self) < 0.1
    }
}
export {
    ally_health_less_than_50,
    self_mana_less_than_10,
}