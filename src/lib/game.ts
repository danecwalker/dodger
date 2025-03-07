import { Cube } from "./cube";
import { Player } from "./player";

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  draw(
    ctx: CanvasRenderingContext2D,
    events: Event[],
    delta: number,
    entities: Entity[],
    state: State,
  ): State;
}

export interface Event {
  type: string;
  x: number;
  y: number;
}

export class State {
  highscore: number;
  points: number;
  health: number;
  freq: number;
  badChance: number;
  COLLECT_SOUND: HTMLAudioElement[];
  BAD_SOUND: HTMLAudioElement[];
  constructor() {
    let hs = localStorage.getItem("highscore");
    if (hs === null) {
      this.highscore = 0;
    } else {
      this.highscore = parseInt(hs);
    }
    this.points = 0;
    this.health = 100;
    this.freq = 0.2;
    this.badChance = 0.0;
    this.COLLECT_SOUND = [];
    this.BAD_SOUND = [];
  }

  playGood() {
    let audio = new Audio("/collect.wav");
    audio.volume = 0.2;
    this.COLLECT_SOUND.push(audio);
    audio.play();

    audio.onended = () => {
      const index = this.COLLECT_SOUND.indexOf(audio);
      if (index > -1) {
        this.COLLECT_SOUND.splice(index, 1);
      }
    };
  }

  playBad() {
    let audio = new Audio("/bad.wav");
    audio.volume = 0.2;
    this.BAD_SOUND.push(audio);
    audio.play();

    audio.onended = () => {
      const index = this.BAD_SOUND.indexOf(audio);
      if (index > -1) {
        this.BAD_SOUND.splice(index, 1);
      }
    };
  }

  addPoint() {
    this.playGood();
    this.points += 50;
    this.freq += 0.04;
    this.health += 5;
    this.health = Math.min(this.health, 100);
    this.badChance += 0.01;
    if (this.points > this.highscore) {
      this.highscore = this.points;
    }
  }

  removePoint() {
    this.playBad();
    this.health -= 10;
  }

  resetPoints() {
    this.points = 0;
    this.freq = 0.2;
    this.badChance = 0.1;
    this.health = 100;
  }
}

function getRandomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export class Game {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  entities: Entity[];
  events: Event[];
  state: State;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.entities = [];
    this.events = [];
    this.state = new State();
    this.ctx.canvas.addEventListener("click", (event) => {
      this.events.push({ type: "click", x: event.clientX, y: event.clientY });
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === " ") {
        event.preventDefault();
        this.events.push({ type: "click", x: 0, y: 0 });
      }
    });
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  start(cb: (points: number, hs: number) => void) {
    this.state.resetPoints();
    this.entities = [];
    let lastTime = 0;
    let fps = 0;
    let frameCount = 0;
    let fpsInterval = 1000; // Update FPS every second
    let lastFpsUpdate = lastTime;
    this.addEntity(
      new Player(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2),
    );

    this.addEntity(
      new Cube(getRandomBetween(40, this.ctx.canvas.width - 70), -40, true),
    );
    let s = 0;
    const renderLoop = (timestamp: number) => {
      console.log("FPS:", fps);
      const deltaTime = (timestamp - lastTime) / 1000; // Convert ms to seconds
      lastTime = timestamp;
      this.ctx.fillStyle = "rgb(39, 45, 45)";
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = "#1C2121";
      this.ctx.beginPath();
      this.ctx.arc(40, this.height / 2, 20, 0, Math.PI * 2);
      this.ctx.fillRect(40, this.height / 2 - 20, this.width - 80, 40);
      this.ctx.arc(this.width - 40, this.height / 2, 20, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.fill();

      // spawn every state.freq/second
      s += deltaTime;
      if (s >= 1 / this.state.freq) {
        s = 0;
        this.addEntity(
          new Cube(
            getRandomBetween(40, this.ctx.canvas.width - 70),
            -40,
            Math.random() > this.state.badChance,
          ),
        );
      }

      this.entities.forEach(
        (entity) =>
          (this.state = entity.draw(
            this.ctx,
            this.events,
            deltaTime,
            this.entities,
            this.state,
          )),
      );

      // render points
      this.ctx.fillStyle = "#edf5fc";
      this.ctx.font = "100px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        `${this.state.points}`,
        this.width / 2,
        this.height * 0.75,
      );

      // render points
      this.ctx.fillStyle = "#edf5fc";
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.fillText(`${this.state.highscore}`, 30, 30);

      // chances && freq
      this.ctx.fillStyle = "#edf5fc";
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        `Chances: ${this.state.badChance.toFixed(2)} | Freq: ${this.state.freq.toFixed(2)}`,
        this.width / 2,
        this.height - 40,
      );

      // if standalone
      this.ctx.fillStyle = "#ED1C24";
      if (iOS() && standalone()) {
        this.ctx.fillRect(
          0,
          this.height - 40,
          (this.width * this.state.health) / 100,
          40,
        );
      } else {
        this.ctx.fillRect(
          0,
          this.height - 20,
          (this.width * this.state.health) / 100,
          20,
        );
      }

      // delta
      frameCount++;
      if (timestamp - lastFpsUpdate >= fpsInterval) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = timestamp;
      }

      if (this.state.health <= 0) {
        cb(this.state.points, this.state.highscore);
      } else {
        requestAnimationFrame(renderLoop);
      }
    };

    requestAnimationFrame(renderLoop);
  }
}
