import type { Entity, Event, State } from "./game";
import { ParticleSystem } from "./particles";
import { Player } from "./player";

function getRandomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export class Cube implements Entity {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  good: boolean;

  constructor(x: number, y: number, good: boolean) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.vx = getRandomBetween(-200, 200);
    this.vy = 100;
    this.vz = this.vx > 0 ? 100 : -100;
    this.good = good;
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
    this.z += this.vz * delta;
    this.z = this.z % 360;
    if (this.x > ctx.canvas.width - 15) {
      this.x = ctx.canvas.width - 15;
      this.vx = -this.vx;
      this.vz = this.vx > 0 ? 100 : -100;
    } else if (this.x < 15) {
      this.x = 15;
      this.vx = -this.vx;
      this.vz = this.vx > 0 ? 100 : -100;
    }

    if (this.y > ctx.canvas.height) {
      entities.splice(entities.indexOf(this), 1);
    }

    const player = entities.find((entity) => entity instanceof Player);
    if (player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 40) {
        entities.push(new ParticleSystem(this.x, this.y, this.good));
        if (this.good) {
          state.addPoint();
        } else {
          state.removePoint();
        }

        entities.splice(entities.indexOf(this), 1);
        return state;
      }
    }

    ctx.fillStyle = this.good ? "#23CE6B" : "#ED1C24";
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.z * Math.PI) / 180);
    // ctx.filter = "blur(8px)";
    // ctx.fillRect(-15, -15, 30, 30);
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillRect(-15, -15, 30, 30);
    ctx.restore();

    return state;
  }
}
