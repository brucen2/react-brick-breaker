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
    // Reset ball position and velocity
    setBall({ x: 200, y: 250, dx: 1, dy: -3 });

    // Reset bricks
    setBricks(Array.from({ length: nrows }, () => Array(ncols).fill(true)));

    // Reset paddle position
    setPaddleX(250 - paddlew / 2);

    // Restart the game loop if it's not running
    if (!intervalId) {
      const interval = setInterval(updateGameState, 10);
      setIntervalId(interval);
    }
  };

  // Function to update the game state
  const updateGameState = () => {
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

    if (newBall.y + ballRadius >= height) {
      clearInterval(intervalId);
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
  }, [ball, bricks, paddleX]);

  // Mouse movement handler for paddle control
  const handleMouseMove = (event) => {
    const canvasPos = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - canvasPos.left;

    // Calculate new paddle position
    let newPaddleX = mouseX - paddlew / 2;

    // Ensure the paddle stays within the canvas
    newPaddleX = Math.max(newPaddleX, 0); // Prevents the paddle from going beyond the left edge
    newPaddleX = Math.min(newPaddleX, width - paddlew); // Prevents the paddle from going beyond the right edge

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
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button className="btn btn-primary" onClick={resetGame}>
        Play Again
      </button>
    </div>
  );
}

export default BrickBreaker;
