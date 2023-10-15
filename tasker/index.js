import { uuid } from "./utils.js"

const data = {
    elements: {},
    root_element: {
        child_elements: [],
    },
}
const add_task = () => {

}
const add_section = () => {

}
const add_element = (x) => {
    let id = uuid()
    data.elements[id] = {
        kind: x.kind,
        args: x.args,
    }
    let parent_element
    if (x.parent_id) {
        parent_element = data.elements[parent_id]
    } else {
        parent_element = data.root_element
    }
    parent_element.child_elements.push(id)
    refresh()
}
const main = () => {
    add_element({
        kind: 'title_0',
        args: {
            text: 'Making cakes'
        }
    })
    add_element({
        kind: 'text',
        args: {
            text: 'Our plan to make cakes'
        }
    })
    const tasks_id = add_element({
        kind: 'title_1',
        args: {
            text: 'tasks'
        }
    })
    add_element({
        parent: tasks_id,
        kind: 'task',
        args: {
            title: 'Define scope',
        }
    })
    add_element({
        parent: tasks_id,
        kind: 'task',
        args: {
            title: 'Scope',
        }
    })
}
const render = () => {
    document.body.innerHTML = `
        <div id="left_panel">
        </div>
        <div id="center_panel">
        </div>
        <div id="right_panel">
        </div>
    `
    document.getElementById("center_panel").innerHTML = ``
}
main()
render()
