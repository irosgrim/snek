let joystick;

let timeoutCreate;
function createThrottle (evt) {
  clearTimeout(timeoutCreate);
  timeoutCreate = setTimeout(() => {
    createNipple(evt);
  }, 100);
}

createNipple('static');

function bindNipple() {
  joystick.on('dir:up plain:up dir:left plain:left dir:down plain:down dir:right plain:right',
        function(evt, data) {
          const angle = data.direction.angle;
          if (angle === "up") {
            window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}))
          }
          if (angle === "down") {
            window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))
          }
          if (angle === "left") {
            window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}))
          }
          if (angle === "right") {
            window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}))
          }
        }
       );
}

function createNipple(type) {
  if (joystick) {
    joystick.destroy();
  }
  const options = {
    mode: 'dynamic',
    color: '#ababab',
    multitouch: true
  }
  joystick = nipplejs.create(options);
  bindNipple();
}
