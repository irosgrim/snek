const x = document.getElementById("x");
const y = document.getElementById("y");
const swipe = document.getElementById("swipe");
const circle = document.getElementById("circle");

let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

let deltaX = 0;
let deltaY = 0;
let distMoved = 0;
    
function checkDirection() {
  if (touchendX < touchstartX) {
    swipe.innerText = "swiped left";
  }
  if (touchendX > touchstartX) {
    swipe.innerText = "swiped right";
  }
  if (touchendY < touchstartY) {
    swipe.innerText = "swiped up";
  }
  if (touchendY > touchstartY) {
    swipe.innerText = "swiped down";
  }
}

document.addEventListener('touchstart', e => {
    document.body.style.overflow = "hidden";
    x.innerText = e.changedTouches[0].screenX;
    y.innerText = e.changedTouches[0].screenY;
    circle.style.visibility = "visible";
    circle.style.top = e.changedTouches[0].pageY - 40 + "px";
    circle.style.left = e.changedTouches[0].pageX - 35 + "px";

    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
    
})
addEventListener('touchmove', (e) => {
    x.innerText = e.changedTouches[0].screenX;
    y.innerText = e.changedTouches[0].screenY;
    circle.style.top = e.changedTouches[0].pageY - 40 + "px";
    circle.style.left = e.changedTouches[0].pageX - 35 + "px";


    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;

    const endX = e.changedTouches[0].screenX;
    const endY = e.changedTouches[0].screenY;
    const deltaX = endX - touchstartX;
    const deltaY = endY - touchstartY;

    // [x, y]
    let move = [0, 0];
    // moved horizontally
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move[0] = deltaX < 0 ? -1 : 1;
    }
    // moved vertically
     else if (Math.abs(deltaX) < Math.abs(deltaY)) {
        move[1] = deltaY < 0 ? -1 : 1;
    } else {
        move = [0, 0];
    }

    if (move[0] > 0) {
        swipe.innerText = "right";
    }
    if (move[0] < 0) {
        swipe.innerText = "left";
    }
    if (move[1] > 0) {
        swipe.innerText = "down";
    }
    if (move[1] < 0) {
        swipe.innerText = "up";
    }
});
document.addEventListener('touchend', e => {
    document.body.style.overflow = "auto";
    circle.style.visibility = "hidden"
})