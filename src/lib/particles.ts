import type { Entity, Event, State } from "./game";
import { Player } from "./player";

function getRandomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

class Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.vx = getRandomBetween(-300, 300);
    this.vy = getRandomBetween(-300, 300);
    this.vz = this.vx > 0 ? 100 : -100;
    this.color = color;
    this.size = size;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    events: Event[],
    delta: number,
    entities: Entity[],
    state: State,
    self: ParticleSystem,
  ): State {
    if (
      this.x < 0 ||
      this.x > ctx.canvas.width ||
      this.y < 0 ||
      this.y > ctx.canvas.height ||
      this.size <= 0
    ) {
      self.particles = self.particles.filter((particle) => particle !== this);
      return state;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.z * Math.PI) / 180);
    ctx.shadowBlur = this.size / 2;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
    this.z += this.vz * delta;
    this.z = this.z % 360;
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.size -= delta * 15;
    return state;
  }
}

export class ParticleSystem implements Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  good: boolean;
  particles: Particle[];

  constructor(x: number, y: number, good: boolean) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.particles = [
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
      new Particle(x, y, good ? "#23CE6B" : "#ED1C24", 10),
    ];
    this.good = good;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    events: Event[],
    delta: number,
    entities: Entity[],
    state: State,
  ): State {
    this.particles.forEach((particle) => {
      particle.draw(ctx, events, delta, entities, state, this);
    });
    if (this.particles.length === 0) {
      entities.splice(entities.indexOf(this), 1);
    }
    return state;
  }
}
