import React, { useRef, useState, useEffect } from "react";

function BrickBreaker() {
  // Global Variables
  let x = 200; // starting horizontal position of ball
  let y = 250; // starting vertical position of ball
  let dx = 1; // amount ball should move horizontally
  let dy = -3; // amount ball should move vertically

  let paddleh = 10; // paddle height (pixels)
  let paddlew = 75; // paddle width (pixels)
  let canvasMinX = 0; // minimum canvas x bounds
  let canvasMaxX = 0; // maximum canvas x bounds
  let [intervalId, setIntervalId] = useState(null);
  let nrows = 9; // number of rows of bricks
  let ncols = 9; // number of columns of bricks
  let brickHeight = 15; // height of each brick
  let padding = 1; // how far apart bricks are spaced

  let ballRadius = 10; // size of ball (pixels)
  // Change colors of bricks -- add as many colors as you like
  let brick_colors = ["darkred", "yellow", "darkgreen", "darkblue", "indigo"];
  let paddlecolor = "black";
  let ballcolor = "white";
  let backcolor = "grey";
  let status = "";
  let score = 0; // store the number of bricks eliminated
  let paused = false; // keeps track of whether the game is paused (true) or not (false)
  let [bricks, setBricks] = useState(
    Array.from({ length: nrows }, () => Array(ncols).fill(true))
  );
  let [mouseX, setMouseX] = useState(0);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    //-------------------------
    // FUNCTION DECLARATIONS
    //-------------------------
    // initialize game

    var width = 500;
    var height = 300;
    var paddlex = width / 2;
    var brickWidth = width / ncols - 1;
    var canvasMinX = 0;
    var canvasMaxX = canvasMinX + width;

    function init() {
      var width = 500;
      var height = 300;
      var paddlex = width / 2;
      var brickWidth = width / ncols - 1;
      var canvasMinX = 0;
      var canvasMaxX = canvasMinX + width;
      init_bricks();
      clear();
      draw_bricks();
      start_animation();
    }

    function reload() {
      stop_animation();
      x = 200; // starting horizontal position of ball
      y = 250; // starting vertical position of ball
      dx = 1; // amount ball should move horizontally
      dy = -3; // amount ball should move vertically
      score = 0;
      status = "";
      // update_status_text();
      init();
    }

    // used to draw the ball
    function circle(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    // used to draw each brick & the paddle
    function rect(x, y, w, h) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
      ctx.fill();
    }

    // clear the screen in between drawing each animation
    function clear() {
      ctx.fillStyle = backcolor;
      ctx.clearRect(0, 0, width, height);
      rect(0, 0, width, height);
    }

    let onMouseMove = (event) => {
      if (canvas) {
        const canvasPos = canvas.getBoundingClientRect();
        const mouseX = event.clientX - canvasPos.left;
        if (mouseX > 0 && mouseX < width) {
          paddlex = Math.max(mouseX - paddlew / 2, 0);
          paddlex = Math.min(width - paddlew, paddlex);
        }
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);

    function onKeyPress(evt) {
      pause();
    }

    function pause() {
      if (status != "Game Over") {
        if (paused) {
          // if paused, begin animation again
          start_animation();
          status = "";
          update_status_text();
        } else {
          // if unpaused, clear the animation
          status = "Paused";
          update_status_text();
          stop_animation();
        }
        paused = !paused;
      }
    }

    // initialize array of bricks to be visible (true)
    function init_bricks() {
      const newBricks = Array.from({ length: nrows }, () =>
        Array(ncols).fill(true)
      );
      setBricks(newBricks);
    }

    // render the bricks
    function draw_bricks() {
      for (let i = 0; i < nrows; i++) {
        // for each row of bricks
        for (let j = 0; j < ncols; j++) {
          // for each column of bricks
          // set the colors to alternate through
          // all colors in brick_colors array
          // modulus (%, aka remainder) ensures the colors
          // rotate through the whole range of brick_colors
          ctx.fillStyle = brick_colors[(i + j) % brick_colors.length];
          if (bricks[i][j]) {
            rect(
              j * (brickWidth + padding) + padding,
              i * (brickHeight + padding) + padding,
              brickWidth,
              brickHeight
            );
          } // else if bricks[i][j] is false it's already been hit
        }
      }
    }

    function draw() {
      // before drawing, change the fill color
      ctx.fillStyle = backcolor;
      clear();
      ctx.fillStyle = ballcolor;
      //draw the ball
      circle(x, y, ballRadius);
      ctx.fillStyle = paddlecolor;
      //draw the paddle
      rect(paddlex, height - paddleh, paddlew, paddleh);
      draw_bricks();

      //check if we have hit a brick
      var rowheight = brickHeight + padding;
      var colwidth = brickWidth + padding;
      var row = Math.floor(y / rowheight);
      var col = Math.floor(x / colwidth);
      //if so reverse the ball and mark the brick as broken
      if (y < nrows * rowheight && row >= 0 && col >= 0 && bricks[row][col]) {
        dy = -dy;
        bricks[row][col] = false;
        score += 1;
        // update_score_text();
      }

      //contain the ball by rebouding it off the walls of the canvas
      if (x + dx > width || x + dx < 0) dx = -dx;

      if (y + dy < 0) {
        dy = -dy;
      } else if (y + dy > height - paddleh) {
        // check if the ball is hitting the
        // paddle and if it is rebound it
        if (x > paddlex && x < paddlex + paddlew) {
          dy = -dy;
        }
      }
      if (y + dy > 300) {
        //game over, so stop the animation
        status = "Game Over";
        // update_status_text();
        return;
        // stop_animation();
      }
      x += dx;
      y += dy;
    }

    function update_score_text() {
      // You can send data to your HTML
      // just like setting styles in CSS
      // Put <div id="score"></div> in
      // your HTML for this text to display
      // $("#score").text("Score: " + score);
    }

    function update_status_text() {
      // You can send data to your HTML
      // just like setting styles in CSS
      // Put <div id="score"></div> in
      // your HTML for this text to display
      // $("#status").text(status);
    }

    function start_animation() {
      if (intervalId === null) {
        // Only start a new interval if one isn't already running
        const newIntervalId = setInterval(draw, 10);
        setIntervalId(newIntervalId);
      }
    }

    function stop_animation() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null); // Reset the interval ID after clearing
      }
    }

    // Commands
    init();
  }, [x]);

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={300} />
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button className="btn btn-primary">Play Again</button>
    </div>
  );
}

export default BrickBreaker;
