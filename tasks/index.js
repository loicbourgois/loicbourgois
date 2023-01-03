import {
    uuid,
} from './utils.js'


const people = {
    '01': 'John',
    '02': 'Bob',
    '03': 'Alice',
}


const tasks = {}


const add_task = ({title}) => {
    tasks.push({
        'title': title
    })
}


add_task({
    title: 'Cut wood',
})
add_task({
    title: 'Build wall',
})
