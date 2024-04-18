import {get_member} from '../member.js'
const meditate = {
    label: 'Meditate',
    max_timer: 5,
    mana_need: 0,
    function: (teams, smid) => {
        const self = get_member(teams, smid)
        self.mana = Math.random() * 0.3 * self.max_mana
    }
}
const attack = {
    label: 'Attack',
    max_timer: 5,
    mana_need: 0,
    function: (teams, smid, target) => {
        const self = get_member(teams, smid)
        target.life = Math.max(
            target.life - self.strength,
            0
        )
    }
}
const heal = {
    label: 'Heal',
    max_timer: 2,
    mana_need: 10,
    function: (teams, smid, target, action) => {
        const self = get_member(teams, smid)
        if ( self.mana >= action.mana_need ) {
            self.mana -= action.mana_need
            target.life = Math.min(
                target.life + self.magic,
                target.max_life
            )
        }
    }
}
const wait = {
    label: 'Wait',
    max_timer: Infinity,
    mana_need: 0,
    function: () => {}
}
export {
    meditate,
    heal,
    wait,
    attack,
}