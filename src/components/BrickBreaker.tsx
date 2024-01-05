import React, { useRef, useState, useEffect } from "react";

// Global Variables
var x = 200; // starting horizontal position of ball
var y = 250; // starting vertical position of ball
var dx = 1; // amount ball should move horizontally
var dy = -3; // amount ball should move vertically
// Variables set in init()
var ctx, width, height, paddlex, bricks, brickWidth;

var paddleh = 10; // paddle height (pixels)
var paddlew = 75; // paddle width (pixels)
var canvasMinX = 0; // minimum canvas x bounds
var canvasMaxX = 0; // maximum canvas x bounds
var intervalId = 0; // track refresh rate for calling draw()
var nrows = 9; // number of rows of bricks
var ncols = 9; // number of columns of bricks
var brickHeight = 15; // height of each brick
var padding = 1; // how far apart bricks are spaced

var ballRadius = 10; // size of ball (pixels)
// Change colors of bricks -- add as many colors as you like
var brick_colors = ["darkred", "yellow", "darkgreen", "darkblue", "indigo"];
var paddlecolor = "black";
var ballcolor = "white";
var backcolor = "grey";
var status = "";
var score = 0; // store the number of bricks eliminated
var paused = false; // keeps track of whether the game is paused (true) or not (false)
var bricks;

function BrickBreaker() {
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
      // init();
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

    // What do to when the mouse moves within the canvas
    function onMouseMove(evt) {
      // set the paddle position if the mouse position
      // is within the borders of the canvas
      if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
        paddlex = Math.max(evt.pageX - canvasMinX - paddlew / 2, 0);
        paddlex = Math.min(width - paddlew, paddlex);
      }
    }

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
      bricks = new Array(nrows);
      for (let i = 0; i < nrows; i++) {
        // for each row of bricks
        bricks[i] = new Array(ncols);
        for (let j = 0; j < ncols; j++) {
          // for each column of bricks
          bricks[i][j] = true;
        }
      }
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
      if (y + dy > height) {
        //game over, so stop the animation
        status = "Game Over";
        // update_status_text();
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
      intervalId = setInterval(draw, 10);
    }

    function stop_animation() {
      clearInterval(intervalId);
    }

    // Commands
    clear();
    init_bricks();
    draw_bricks();
    draw();
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={300} />
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button className="btn btn-primary">Play Again</button>
    </div>
  );
}

export default BrickBreaker;
