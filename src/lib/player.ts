import type { Entity, Event, State } from "./game";

export class Player implements Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 200;
    this.vy = 0;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    events: Event[],
    delta: number,
    entities: Entity[],
    state: State,
  ): State {
    // calculate new position
    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (events.at(0)?.type === "click") {
      this.vx = -this.vx;
      events.pop();
    }

    if (this.x > ctx.canvas.width - 40) {
      this.x = ctx.canvas.width - 40;
      this.vx = -this.vx;
    } else if (this.x < 40) {
      this.x = 40;
      this.vx = -this.vx;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = "#edf5fc";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    return state;
  }
}
