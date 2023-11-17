import {
    get_member,
    get_team,
} from '../member.js'
const self = {
    label: "Self",
    function: (teams, mid) => {
        const self = get_member(teams, mid)
        return self
    }
}
const ennemy = {
    label: "Ennemy",
    function: (teams, mid) => {
        const team_id = (mid[0]+1)%2
        const team = get_team(teams, [team_id])
        for (const member of team.members) {
            if (!member.dead) {
                return member
            }
        }
    }
}
const ally_lowest_health = {
    label: "Ally with lowest health",
    function: (teams, mid) => {
        const team = get_team(teams, mid)
        let min = Infinity
        let ally_choice = null
        for (const ally of team.members) {
            if (ally.life < min && !ally.dead) {
                ally_choice = ally
                min = ally.life
            }
        }
        return ally_choice
    }
}
export {
    self,
    ally_lowest_health,
    ennemy,
}
