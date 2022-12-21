import { Coord } from "./types";

class VirtualJoyStick {
  options: any = {};
  swipe: string = "";
  touchStartCenter: Coord = {
    x: 0,
    y: 0,
  };
  touchEndCenter: Coord = {
    x: 0,
    y: 0,
  };
  el = {
    id: "circle",
    style: {
      top: "0",
      left: "0",
      size: 50,
      color: "#333333",
      opacity: "0.5",
      position: "absolute",
    }
  };
  threshold = 5;
  move: Coord = {
    x: 0,
    y: 0,
  }
  readableDirection = "center";
  direction: Coord = {
    x: 0,
    y: 0,
  }
  isTouching = false;
  constructor(options?: any) {
    this.options = options || {};
    this.createJoystickBg();
    this.createJoystickElement();
  }
  distance (p1: Coord, p2: Coord) {
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  createJoystickElement () {
    const div = document.createElement("div");
    div.setAttribute("id", this.el.id);
    div.style.top = this.el.style.top + "px";
    div.style.left = this.el.style.left + "px";
    div.style.width = this.el.style.size + "px";
    div.style.height = this.el.style.size + "px";
    div.style.backgroundColor = this.el.style.color;
    div.style.borderRadius = "50%";
    div.style.position = this.el.style.position;
    div.style.opacity = this.el.style.opacity;
    div.style.visibility = "hidden";
    document.body.appendChild(div);
  }

  createJoystickBg () {
    const div = document.createElement("div");
    div.setAttribute("id", "joy_bg");
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = "70px";
    div.style.height = "70px";
    div.style.backgroundColor = "#cccccc";
    div.style.borderRadius = "50%";
    div.style.position = "absolute";
    div.style.opacity = "0.5";
    div.style.visibility = "hidden";
    document.body.appendChild(div);
  }

  changeBodyStyle() {
    document.body.style.touchAction = "none";
    document.body.style.position = "relative";
  }

  init () {
    this.changeBodyStyle();
    if (this.options.debug) {
      this.createDebugEl();
    }
    this.showDebug();
    const circle = document.getElementById("circle");
    const circleBg = document.getElementById("joy_bg");
   
    if (circle) {
      const bigCircleRadius = 35;
      const smallCircleRadius = 25;
      const touchRadius = {
        x: 0,
        y: 0,
      }
      let startX = 0;
      let startY = 0;

      document.addEventListener('touchstart', e => {
        e.preventDefault();
        if (circle && circleBg) {
          this.isTouching = true;
          touchRadius.x = e.touches[0].radiusX;
          touchRadius.y = e.touches[0].radiusY;

          const touchStartX = e.changedTouches[0].pageX - bigCircleRadius - touchRadius.x;
          const touchStartY = e.changedTouches[0].pageY - bigCircleRadius - touchRadius.y;

          this.touchStartCenter.x = touchStartX;
          this.touchStartCenter.y = touchStartY;

          startX = e.changedTouches[0].screenX;
          startY = e.changedTouches[0].screenY;

          document.body.style.overflow = "hidden";
          circle.style.visibility = "visible";
          circle.style.top = e.changedTouches[0].pageY - smallCircleRadius - touchRadius.y + "px";
          circle.style.left = e.changedTouches[0].pageX - smallCircleRadius - touchRadius.x + "px";
          
          circleBg.style.visibility = "visible";
          circleBg.style.top = touchStartY + "px";
          circleBg.style.left = touchStartX + "px";

          this.dispatchEvent();
          this.showDebug();
        }
        
      })

      document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const smallCircle = {
          x: e.changedTouches[0].pageX - smallCircleRadius - touchRadius.x,
          y: e.changedTouches[0].pageY - smallCircleRadius - touchRadius.y,
        }
        const d = this.distance(this.touchStartCenter, {x: smallCircle.x, y: smallCircle.y});
        const angle = Math.atan2(smallCircle.y - this.touchStartCenter.y, smallCircle.x - this.touchStartCenter.x);
        if (d > bigCircleRadius) {
          const smallCircleX = this.touchStartCenter.x + bigCircleRadius * Math.cos(angle);
          const smallCircleY = this.touchStartCenter.y + bigCircleRadius * Math.sin(angle);

          circle.style.left = smallCircleX + "px";
          circle.style.top = smallCircleY + "px";
        } else {
          circle.style.top = smallCircle.y + "px";
          circle.style.left = smallCircle.x + "px";
        }

        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // moved horizontally
        if (Math.abs(deltaX) > Math.abs(deltaY) + this.threshold) {
          this.direction.x = deltaX > this.threshold ? 1 : deltaX < -this.threshold ? -1 : 0;
          this.direction.y = deltaY > this.threshold ? 1 : deltaY < -this.threshold ? -1 : 0;
           if (deltaX < 0) {
            this.move.x = -1;
            this.move.y = 0;
          } else {
            this.move.x = 1;
            this.move.y = 0;
          }
        }
        // moved vertically
        else if (Math.abs(deltaX) + this.threshold < Math.abs(deltaY)) {
          this.direction.y = deltaY > this.threshold ? -1 : deltaY < -this.threshold ? 1 : 0;
          this.direction.x = deltaX > this.threshold ? -1 : deltaX < -this.threshold ? 1 : 0;
          if (deltaY < 0) {
            this.move.y = -1;
            this.move.x = 0;

          } else {
            this.move.y = 1;
            this.move.x = 0;
          }
        } 
        else {
          this.move.x = 0;
          this.move.y = 0;
          this.direction.x = 0;
          this.direction.y = 0;
        }

        if (this.move.x > 0) {
          this.readableDirection = "right";
          window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}));
        }
        if (this.move.x < 0) {
          this.readableDirection = "left";
          window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
        }
        if (this.move.y > 0) {
          this.readableDirection = "down";
          window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}));
        }
        if (this.move.y < 0) {
          this.readableDirection = "up";
          window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}));
        }
        if (this.move.x === 0 && this.move.y === 0) {
          this.readableDirection = "center";
          // window.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}));
        }
        this.dispatchEvent();
        this.showDebug();
      });

      document.addEventListener('touchend', e => {
        if (circle && circleBg) {
          document.body.style.overflow = "auto";
          circle.style.visibility = "hidden"
          circleBg.style.visibility = "hidden"
          this.isTouching = false;
          this.dispatchEvent();
          this.showDebug();
        }
      })
    }
  }

  createDebugEl() {
    const div = document.createElement("div");
    div.setAttribute("id", "debug");
    document.body.appendChild(div);
  }

  showDebug() {
    const debug = document.getElementById("debug");
    if (debug && this.options.debug === true) {
      let out = "";
      for (const prop in this.eventPayload) {
        const p = document.createElement("p");
        out += `<p>${prop}: ${JSON.stringify(this.eventPayload[prop])}</p>`;
      }
      debug.innerHTML = out;
    }
  }

  dispatchEvent() {
    window.dispatchEvent(new CustomEvent("v-joystick", {detail: this.eventPayload}));
  }

  get eventPayload(): {[key: string]: any} {
    return {
      move: this.move,
      direction: this.direction,
      isTouching: this.isTouching,
      readableDirection: this.readableDirection,
    };
  }
}

export default VirtualJoyStick;