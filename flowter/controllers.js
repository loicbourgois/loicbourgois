const new_controller = (parent_id, get_callback, set_callback) => {
  const controller = document.createElement('div');
  controller.classList.add('controller');

  controller.start_update = (pageX, pageY) => {
    controller.start_pageX = pageX
    controller.start_pageY = pageY
    controller.start_update_value = controller.get()
  }
  controller.update = (pageY) => {
    dy = controller.start_pageY - pageY;
    controller.set(controller.start_update_value + dy * update_nucleobase_value_ratio)
  }
  controller.set = (value) => {
    set_callback(value)
    controller.value_div.update()
  }
  controller.get = () => {
    return get_callback()
  }

  controller.addEventListener('mousedown', e => {
    controller.start_update(e.pageX, e.pageY)
    mousedown_x = e.pageX;
    mousedown_y = e.pageY;
    mousedown_controller = controller;
  });

  document.getElementById(parent_id).appendChild(controller);

  controller.value_div = document.createElement('div');
  const nucleobase_value_div = controller.value_div;
  nucleobase_value_div.classList.add('controller_value_div');
  controller.appendChild(nucleobase_value_div);

  controller.value_div.update = () => {
    controller.value_div.style.width = controller.offsetWidth * controller.get() + 'px';
    controller.value_div.style.height = controller.offsetHeight * controller.get() + 'px';
  }

  controller.value_div.update()

  // return controller
}
