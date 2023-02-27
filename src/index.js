/* ================ */
/*    02/27/2023    */
/*    Snake Game    */
/* ================ */

// Cell used for anything
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(snake) {
        snake.ctx.fillStyle = "black";
        snake.ctx.fillRect(this.x * (snake.canvas.width / snake.gridCount), this.y * (snake.canvas.height / snake.gridCount), (snake.canvas.width / snake.gridCount) + .5, (snake.canvas.height / snake.gridCount) + .5);
    }
}

// Cell used for the snake
class SnakeCell extends Cell {
    constructor(x, y) {
        super(x, y);

        this.isHead = false;
        this.hue = 0;
    }

    draw(snake) {
        if (snake.isRainbow !== -1) {
            snake.ctx.fillStyle = `hsl(${this.hue}, 90%, 50%)`;
            this.hue += 1;
            snake.isRainbow += 1;

            if (snake.isRainbow > 5000) {
                snake.isRainbow = -1;
            }
        } else {
            if ((this.index + 1) % 2 === 0) {
                snake.ctx.fillStyle = "#7dd649";
            } else {
                snake.ctx.fillStyle = "#8aee50";
            }
        }
        snake.ctx.fillRect(this.x * (snake.canvas.width / snake.gridCount), this.y * (snake.canvas.height / snake.gridCount), (snake.canvas.width / snake.gridCount) + .5, (snake.canvas.height / snake.gridCount) + .5);
    }
}

// Cell used for any drops
class DropCell extends Cell {
    constructor(x, y) {
        super(x, y);
    }

    draw(snake) {
        snake.ctx.fillStyle = "#e92d2d";
        snake.ctx.fillRect(this.x * (snake.canvas.width / snake.gridCount), this.y * (snake.canvas.height / snake.gridCount), (snake.canvas.width / snake.gridCount) + .5, (snake.canvas.height / snake.gridCount) + .5);
    }

    interacted(snake) {
        snake.snakeLength += 1;
        snake.dropCells.splice(snake.dropCells.indexOf(this), 1);
    }
}

class RainbowCell extends DropCell {
    constructor(x, y) {
        super(x, y);
        
        this.hue = 0;
    }

    draw(snake) {
        snake.ctx.fillStyle = `hsl(${this.hue}, 90%, 50%)`;
        this.hue += 1;
        snake.ctx.fillRect(this.x * (snake.canvas.width / snake.gridCount), this.y * (snake.canvas.height / snake.gridCount), snake.canvas.width / snake.gridCount, snake.canvas.height / snake.gridCount);
    }

    interacted(snake) {
        snake.isRainbow = 1;
        snake.snakeLength += 1;
        snake.dropCells.splice(snake.dropCells.indexOf(this), 1);
    }
}

class Snake {
    constructor() {
        /* Base Framework */
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.gridCount = 16;
        this.canvas.width = this.gridCount*40;
        this.canvas.height = this.gridCount*40;

        this.logging = true;

        /* Framework Statistics */
        this.lastCalledTime = Date.now();
        this.fps = 1000 / (Date.now() - this.lastCalledTime);
        this.lastFpsUpdate = 0;
        this.lastFpsValue = 0;

        /* Game Logic */
        this.dropCells = [];
        this.snakeCells = [];
        this.xDir = 1;
        this.yDir = 0;
        this.snakeLength = 3;

        this.lastSnakeUpdate = 0;
        this.lastDropUpdate = 100; // Start with a drop
        
        /* Event Listeners */
        document.addEventListener("keydown", (e) => {
            let key = e.key.toLowerCase();

            switch (key) {
                case "arrowup": case "w":
                    this.log("Move up");
                    if (this.yDir !== 1) {
                        this.xDir = 0;
                        this.yDir = -1;
                    }
                    break;
                case "arrowdown": case "s":
                    this.log("Move down");
                    if (this.yDir !== -1) {
                        this.xDir = 0;
                        this.yDir = 1;
                    }
                    break;
                case "arrowleft": case "a":
                    this.log("Move left");
                    if (this.xDir !== 1) {
                        this.xDir = -1;
                        this.yDir = 0;
                    }
                    break;
                case "arrowright": case "d":
                    this.log("Move right");
                    if (this.xDir !== -1) {
                        this.xDir = 1;
                        this.yDir = 0;
                    }
                    break;
                case " ": case "enter":
                    this.log("Restart / Pause");
                    if (this.gameOver > 0) {
                        this.gameOver = 0;
                        this.resetSnake();
                    } else {
                        this.paused = !this.paused;
                    }
                    break;
            }
        });
    }

    // Logging
    log(message) {
        if (!this.logging) {
            return;
        }

        console.warn(message);
    }

    // Drawing Cells
    draw() {
        this.canvas.width = this.canvas.getBoundingClientRect().width;
        this.canvas.height = this.canvas.getBoundingClientRect().height;
    
        if (this.paused) {
            this.drawText();
            return;
        }

        this.dropCells.forEach(cell => {
            cell.draw(this);
        });

        this.snakeCells.forEach(cell => {
            cell.draw(this);
        });
        
        this.drawText();
    }

    drawText() {
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px pixel";
        this.ctx.fillText(`Score: ${this.snakeLength - 3}`, 10, 30);
        this.ctx.fillText(`FPS: ${Math.floor(this.lastFpsValue)}`, 10, 50);

        if (this.gameOver > 0) {
            // Blinking Game Over Text
            if (this.gameOver % 40 < 20) {    
                this.ctx.font = "50px pixel";
                this.ctx.fillText(`Game Over`, this.canvas.width / 2 - 125, this.canvas.height / 2);
                this.ctx.font = "20px pixel";
                this.ctx.fillText(`Score: ${this.snakeLength - 3}`, this.canvas.width / 2 - 125, this.canvas.height / 2 + 30);
                this.ctx.fillText(`Press Space to Restart`, this.canvas.width / 2 - 125, this.canvas.height / 2 + 60);
            }

            this.gameOver += 1;
        } else if (this.paused) {
            this.ctx.font = "50px pixel";
            this.ctx.fillText(`Game Paused`, this.canvas.width / 2 - 150, this.canvas.height / 2);
            this.ctx.font = "20px pixel";
            this.ctx.fillText(`Press Space to Unpause`, this.canvas.width / 2 - 150, this.canvas.height / 2 + 30);
        }
    }

    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }

    // Loop Ran Every Frame
    renderLoop() {
        this.fps = 1000 / (Date.now() - this.lastCalledTime);
        this.lastCalledTime = Date.now();

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.draw();
        this.updateSnake();
        this.updateDrop();
        
        this.lastFpsUpdate += 1;
        if (this.lastFpsUpdate >= 10) {
            this.lastFpsUpdate = 0;
            this.lastFpsValue = this.fps;
        }

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    // Snake Death
    resetSnake() {
        this.dropCells = [];
        this.snakeCells = [];
        this.snakeCells.push(new SnakeCell(Math.floor(this.gridCount / 2), Math.floor(this.gridCount / 2)));
        this.snakeLength = 3;
        this.isRainbow = -1;
    }

    // Snake Movement
    updateSnake() {
        if (this.paused) {
            return;
        }

        this.lastSnakeUpdate += 1;

        if (this.lastSnakeUpdate < 5) {
            return;
        }

        this.lastSnakeUpdate = 0;

        const head = this.snakeCells[0];

        if (!head) {
            return;
        }
        
        let newX = head.x + this.xDir;
        let newY = head.y + this.yDir;

        if (newX < 0) {
            newX = this.gridCount - 1;
            this.log("New X is less than 0");
        } else if (newX >= this.gridCount) {
            newX = 0;
            this.log("New X is greater than grid count");
        }

        if (newY < 0) {
            newY = this.gridCount - 1;
            this.log("New Y is less than 0");
        } else if (newY >= this.gridCount) {
            newY = 0;
            this.log("New Y is greater than grid count");
        }

        const newHead = new SnakeCell(newX, newY);
        this.snakeCells.unshift(newHead);

        if (this.snakeCells.length > this.snakeLength) {
            this.snakeCells.pop();
        }

        for (let i = 1; i < this.snakeCells.length; i++) {
            this.snakeCells[i].index = i;
            if (this.snakeCells[i].x === newHead.x && this.snakeCells[i].y === newHead.y) {
                this.log("Snake collided with itself");
                this.snakeCells = [];
                this.dropCells = [];
                this.gameOver = 1;
            }
        }

        this.dropCells.forEach((cell) => {
            if (cell.x === newHead.x && cell.y === newHead.y) {
                this.log("Snake collided with drop");
                cell.interacted(this);
            }
        });
    }

    // Update Drop
    updateDrop() {
        if (this.gameOver > 0) {
            return;
        }
        
        if (this.dropCells.length > 0) {
            return;
        }

        if (Math.floor(Math.random() * 10) === 0) {
            this.dropCells.push(new RainbowCell(Math.floor(Math.random() * this.gridCount), Math.floor(Math.random() * this.gridCount)));
            return;
        }

        this.dropCells.push(new DropCell(Math.floor(Math.random() * this.gridCount), Math.floor(Math.random() * this.gridCount)));
    }

    // Framework Ready
    ready() {
        this.resetSnake();
        this.renderLoop();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const snake = new Snake();
    snake.ready();
});