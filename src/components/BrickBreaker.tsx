import React, { useRef, useState, useEffect } from "react";

function BrickBreaker() {
  // State for ball position and velocity
  const [ball, setBall] = useState({ x: 200, y: 250, dx: 1, dy: -3 });

  // State for bricks
  const nrows = 9; // Number of rows of bricks
  const ncols = 9; // Number of columns of bricks
  const [bricks, setBricks] = useState(
    Array.from({ length: nrows }, () => Array(ncols).fill(true))
  );

  // State for paddle
  const paddleh = 10; // Paddle height (pixels)
  const paddlew = 75; // Paddle width (pixels)
  const [paddleX, setPaddleX] = useState(250 - paddlew / 2);

  // State for score
  const [score, setScore] = useState(0);

  // State for pause
  const [isPaused, setIsPaused] = useState(false);

  // State for status
  const [status, setStatus] = useState(" ");

  // Other variables
  const canvasRef = useRef(null);
  const [intervalId, setIntervalId] = useState(null);

  // Canvas and game settings
  const width = 500;
  const height = 300;
  const brickHeight = 15;
  const padding = 1;
  const ballRadius = 10;
  const brickWidth = width / ncols - 1;

  // Colors
  const brick_colors = ["darkred", "yellow", "darkgreen", "darkblue", "indigo"];
  const paddlecolor = "black";
  const ballcolor = "white";
  const backcolor = "grey";

  // Function to draw the ball
  const drawBall = (ctx) => {
    ctx.fillStyle = ballcolor;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  };

  // Function to draw the paddle
  const drawPaddle = (ctx) => {
    ctx.fillStyle = paddlecolor;
    ctx.beginPath();
    ctx.rect(paddleX, height - paddleh, paddlew, paddleh);
    ctx.closePath();
    ctx.fill();
  };

  // Function to draw the bricks
  const drawBricks = (ctx) => {
    for (let i = 0; i < nrows; i++) {
      for (let j = 0; j < ncols; j++) {
        if (bricks[i][j]) {
          ctx.fillStyle = brick_colors[(i + j) % brick_colors.length];
          ctx.beginPath();
          ctx.rect(
            j * (brickWidth + padding) + padding,
            i * (brickHeight + padding) + padding,
            brickWidth,
            brickHeight
          );
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  };

  // Function to clear the canvas
  const clearCanvas = (ctx) => {
    ctx.fillStyle = backcolor;
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);
  };

  // Function to reset the game
  const resetGame = () => {
    // Reset status
    setStatus(" ");

    // Reset ball position and velocity
    setBall({ x: 200, y: 250, dx: 1, dy: -3 });

    // Reset bricks
    setBricks(Array.from({ length: nrows }, () => Array(ncols).fill(true)));

    // Reset paddle position
    setPaddleX(250 - paddlew / 2);

    // Reset score
    setScore(0);

    // Restart the game loop if it's not running
    if (!intervalId) {
      const interval = setInterval(updateGameState, 10);
      setIntervalId(interval);
    }
  };

  // Function to update the game state
  const updateGameState = () => {
    if (isPaused) {
      return; // Pause the game update loop
    }

    // Game play.

    const ctx = canvasRef.current.getContext("2d");

    // Update ball position
    let newBall = { ...ball };
    newBall.x += newBall.dx;
    newBall.y += newBall.dy;

    // Wall collision (left/right)
    if (
      newBall.x + newBall.dx > width - ballRadius ||
      newBall.x + newBall.dx < ballRadius
    ) {
      newBall.dx = -newBall.dx;
    }

    // Wall collision (top)
    if (newBall.y + newBall.dy < ballRadius) {
      newBall.dy = -newBall.dy;
    }

    // Paddle collision
    if (newBall.y + newBall.dy > height - ballRadius - paddleh) {
      if (newBall.x > paddleX && newBall.x < paddleX + paddlew) {
        newBall.dy = -newBall.dy;
      }
    }

    // End the game if the paddle is missed
    if (newBall.y + ballRadius - 10 >= height) {
      clearInterval(intervalId);
      setStatus("Game Over");
      return;
    }

    // Brick collision
    let rowHeight = brickHeight + padding;
    let colWidth = brickWidth + padding;
    let row = Math.floor(newBall.y / rowHeight);
    let col = Math.floor(newBall.x / colWidth);

    // Check if ball hits a brick
    if (
      newBall.y < nrows * rowHeight &&
      row >= 0 &&
      col >= 0 &&
      bricks[row][col]
    ) {
      newBall.dy = -newBall.dy; // Rebound the ball
      setScore((score) => score + 1); // Increment score

      // Set the hit brick to false
      const newBricks = bricks.map((brickRow, rIndex) =>
        brickRow.map((brick, cIndex) => {
          if (rIndex === row && cIndex === col) {
            return false; // Brick is hit
          }
          return brick;
        })
      );
      setBricks(newBricks);
    }

    // Update ball state
    setBall(newBall);

    // Clear canvas and redraw everything
    clearCanvas(ctx);
    drawBall(ctx);
    drawPaddle(ctx);
    drawBricks(ctx);
  };

  useEffect(() => {
    const interval = setInterval(updateGameState, 10);
    setIntervalId(interval);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [ball, bricks, paddleX, isPaused]);

  // Handle key press for pause/unpause
  const handleKeyPress = () => {
    setIsPaused((prev) => {
      if (!prev) {
        // If the game is going to be paused
        setStatus("Paused");
      } else {
        // If the game is going to be unpaused
        setStatus(" ");
      }
      return !prev;
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Mouse movement handler for paddle control
  const handleMouseMove = (event) => {
    const canvasPos = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - canvasPos.left;

    // Calculate new paddle position
    let newPaddleX = mouseX - paddlew / 2;

    // Ensure the paddle stays within the canvas
    newPaddleX = Math.max(newPaddleX, 0);
    newPaddleX = Math.min(newPaddleX, width - paddlew);

    setPaddleX(newPaddleX);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
      />
      <p>
        Mouse moves platform &bull; Press any key to pause
        <br />
        Score: {score}
        <br />
        &nbsp; {status} &nbsp;
      </p>
      <button className="btn btn-primary" onClick={resetGame}>
        Play Again
      </button>
    </div>
  );
}

export default BrickBreaker;
