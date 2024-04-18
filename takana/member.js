const remaining_life_percent = (member) => {
    return 1.0-(member.max_life-member.life)/member.max_life
}
const remaining_mana_percent = (member) => {
    return 1.0-(member.max_mana-member.mana)/member.max_mana
}
const remaining_timer_percent = (member) => {
    if (member.max_timer) {
        return 1.0-(member.max_timer-member.timer)/member.max_timer
    } else {
        return 0
    }
}
const assert = (x) => {
    if (!x) {
        throw "Error"
    }
}
const setup_member = (member) => {
    member.life = member.max_life 
    member.mana = member.max_mana
    member.intelligence = member.decision_makers.length
    member.level = 0
    for (const k of ['max_life', 'max_mana']) {
        member.level += member[k] / 100
    }
    for (const k of ['strength', 'intelligence', 'magic']) {
        member.level += member[k]
    }
    member.level = parseInt(Math.sqrt(member.level))
    member.size = member.level / 40
    console.log(member.level)
    for (const maker of member.decision_makers) {
        try {
            assert( maker.action )
            assert( maker.target )
            for (const condition of maker.conditions) {
                assert( condition )
            }
        } catch (error) {
            console.error(maker)
            throw error
        }
    }
}
const setup_members = (teams) => {
    let team_id = 0
    for (const team of teams) {
        let order_position = -1
        for (const member of team.members) {
            setup_member(member)
            member.order_position = order_position+=1
            member.mid = [team_id, order_position]
        }
        team_id += 1
    }
}
const get_member = (teams, mid) => {
    return teams[mid[0]].members[mid[1]]
}
const get_team = (teams, mid) => {
    return teams[mid[0]]
}
const get_team_life_ratio = (team) => {
    let v = 0
    let max = 0
    for (const member of team.members) {
        v += member.life
        max += member.max_life
    } 
    return v/max
}
const get_team_level = (team) => {
    let level = 0
    for (const member of team.members) {
        level += member.level
    } 
    return level
}
export {
    setup_members,
    remaining_life_percent,
    remaining_mana_percent,
    remaining_timer_percent,
    get_team,
    get_member,
    get_team_life_ratio,
    get_team_level,
}
