const up = document.getElementById("up");
const down = document.getElementById("down");
const left = document.getElementById("left");
const right = document.getElementById("right");
const space = document.getElementById("space");

up.addEventListener("click", (e) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}))
});
down.addEventListener("click", (e) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}))
});
left.addEventListener("click", (e) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}))
});
right.addEventListener("click", (e) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}))
});
space.addEventListener("click", (e) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {key: " "}))
});
