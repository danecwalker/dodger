<script lang="ts">
  import { Cube } from "$lib/cube";
  import { Game } from "$lib/game";
  import { Player } from "$lib/player";
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let first = $state(true);
  let done = $state(true);
  let points = $state(0);
  let highscore = $state(0);

  let game: Game;
  const start = () => {
    if (!game) return;
    if (first) {
      first = false;
    }
    done = false;
    points = 0;
    game.start((p, h) => {
      done = true;
      points = p;
      if (p) {
        localStorage.setItem("highscore", h.toString());
        highscore = h;
      }
      console.log("Game over!", p);
    });
  };

  onMount(() => {
    let hs = localStorage.getItem("highscore");
    if (hs === null) {
      highscore = 0;
    } else {
      highscore = parseInt(hs);
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    game = new Game(ctx, canvas.width, canvas.height);
  });
</script>

<div id="container">
  {#if done}
    <div id="popover">
      <div id="popover-content">
        {#if first}
          <h2>Play!</h2>
          <p>Highscore: {highscore}</p>
          <button onclick={start}>Play</button>
        {:else}
          <h2>Game Over!</h2>
          <p>You scored {points} points.</p>
          <button onclick={start}>Play Again</button>
        {/if}
      </div>
    </div>
  {/if}
  <canvas bind:this={canvas} id="game"></canvas>
</div>
