
const joy = new VirtualJoyStick();
joy.init();

window.addEventListener("v-joystick", (e) => {
  const { x, y } = e.detail.move;
  if (y < 0) {
        window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}))
      }
  if (y > 0) {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))
  }
  if (x < 0) {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}))
  }
  if (x > 0) {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}))
  }
})
