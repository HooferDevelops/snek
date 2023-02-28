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
        this.snakeLength = 8;

        this.lastSnakeUpdate = 0;
        this.lastDropUpdate = 100; // Start with a drop

        this.updateLoopRate = 1;
        
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
        for (var i = 0; i < this.updateLoopRate; i++) {
            this.updateSnake();
            this.updateDrop();
        }
        
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
        this.snakeLength = Math.floor(Math.random() * 5) + 3;
        this.isRainbow = -1;
    }

    // Attaching Trainer
    snakeTrain() {

    }

    // Snake Movement
    updateSnake() {
        if (this.paused) {
            return;
        }

        this.lastSnakeUpdate += 1;

        if (this.lastSnakeUpdate < 10) {
            return;
        }

        this.lastSnakeUpdate = 0;

        const head = this.snakeCells[0];

        if (!head) {
            return;
        }

        this.snakeTrain();
        
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

class NeuralNetwork {
    constructor(snake) {
        this.snake = snake;

        let inputLayer = new window.synaptic.Layer(5);
        let hiddenLayer = new window.synaptic.Layer(20);
        let outputLayer = new window.synaptic.Layer(1);

        inputLayer.project(hiddenLayer);
        hiddenLayer.project(outputLayer);

        this.net = new window.synaptic.Network({
            input: inputLayer,
            hidden: [hiddenLayer],
            output: outputLayer
        });

        this.trainedData = [];
        
        this.randomTraining = true;
        this.appleTraining = false;
    }

    fetchTrainingData() {
        return new Promise((resolve, reject) => {
            fetch("data/SnakeNN1.json")
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    this.trainedData = data;
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    hookToGame() {
        let oldSnakeUpdate = this.snake.snakeTrain
        let _this = this;

        function newSnakeUpdate() {
            _this.trainSnake();
            oldSnakeUpdate.call(_this.snake);
        }

        this.snake.snakeTrain = newSnakeUpdate;
    }

    getSnakeBlockage() {
        let head = this.snake.snakeCells[0];

        let results = {
            "front": false,
            "left": false,
            "right": false,
        }

        for (let i = 1; i < this.snake.snakeCells.length; i++) {
            let cell = this.snake.snakeCells[i];

            if (cell.x === head.x - 1 && cell.y === head.y) {
                results["left"] = true;
            }
            
            if (cell.x === head.x + 1 && cell.y === head.y) {
                results["right"] = true;
            }

            if (cell.x === head.x && cell.y === head.y - 1) {
                results["front"] = true;
            }

            

            if (results["front"] && results["left"] && results["right"]) {
                break;
            }
        }

        let resultsArray = [results["front"] ? 1 : 0, results["left"] ? 1 : 0, results["right"] ? 1 : 0];

        return resultsArray;
    }

    trainSnake() {
        if (!this.randomTraining) {
            this.snake.updateLoopRate = 1;
        } else {
            this.snake.updateLoopRate = 100000;
        }

        if (this.randomTraining) {
            let blockage = this.getSnakeBlockage();
            
            let direction = Math.floor(Math.random() * 3) / 2

            if (direction === 0) {
                let oldX = this.snake.xDir;
                this.snake.xDir = this.snake.yDir;
                this.snake.yDir = oldX;
            } else if (direction === 1) {
                let oldX = this.snake.xDir;
                this.snake.xDir = -this.snake.yDir;
                this.snake.yDir = -oldX;
            } else {

            }

            // Check if we are going to hit the edge
            let head = this.snake.snakeCells[0];

            if (!head) {
                return;
            }

            if (head.x + this.snake.xDir < 0 || head.x + this.snake.xDir >= this.snake.gridCount) {
                console.log("Hit edge");
                this.snake.gameOver = 1;
                return;
            } else if (head.y + this.snake.yDir < 0 || head.y + this.snake.yDir >= this.snake.gridCount) {
                console.log("Hit edge");
                this.snake.gameOver = 1;
                return;
            }

            blockage.push(this.snake.snakeLength / (16 * 16));

            let apple = this.snake.dropCells[0];

            if (!apple) {
                apple = {
                    x: 0,
                    y: 0
                }
            }

            // Get angle towards apple, from the front of the snake
            let appleAngle = Math.atan2(apple.y - this.snake.snakeCells[0].y, apple.x - this.snake.snakeCells[0].x);

            let snakeAngle = Math.atan2(this.snake.yDir, this.snake.xDir);

            // Subtract the snake angle from the apple angle
            appleAngle -= snakeAngle;

            // Convert the angle to a 0-1 value
            appleAngle = (appleAngle + Math.PI) / (Math.PI * 2);

            let appleDistance = Math.sqrt(Math.pow(apple.x - this.snake.snakeCells[0].x, 2) + Math.pow(apple.y - this.snake.snakeCells[0].y, 2));

            blockage.push(appleAngle);

            this.net.activate(blockage);
            this.net.propagate(0.3, [direction]);
        } else {
            let apple = this.snake.dropCells[0];

            if (!apple) {
                apple = {
                    x: 0,
                    y: 0
                }
            }

            // Get angle towards apple, from the front of the snake
            let appleAngle = Math.atan2(apple.y - this.snake.snakeCells[0].y, apple.x - this.snake.snakeCells[0].x);

            let snakeAngle = Math.atan2(this.snake.yDir, this.snake.xDir);

            // Subtract the snake angle from the apple angle
            appleAngle -= snakeAngle;

            // Convert the angle to a 0-1 value
            appleAngle = (appleAngle + Math.PI) / (Math.PI * 2);

            let appleDistance = Math.sqrt(Math.pow(apple.x - this.snake.snakeCells[0].x, 2) + Math.pow(apple.y - this.snake.snakeCells[0].y, 2));

            let blockage = this.getSnakeBlockage();
            blockage.push(this.snake.snakeLength / (16 * 16));
            blockage.push(appleAngle);
            let output = this.net.activate(blockage);

            console.log(output);

            // Get closest direction to 0, 0.5, 1 from output
            let direction = Math.round(output[0] * 2 ) / 2;

            console.log(direction);

            console.log(this.snake.xDir, this.snake.yDir);

            // If the direction is 0, turn the snake left
            if (direction === 0) {
                if (this.snake.xDir === 0 && this.snake.yDir === 0) {
                    this.snake.xDir = -1;
                    return;
                }
                console.log("LEFT");
                let oldX = this.snake.xDir;
                this.snake.xDir = this.snake.yDir;
                this.snake.yDir = oldX;
            } else if (direction === 1) {
                if (this.snake.xDir === 0 && this.snake.yDir === 0) {
                    this.snake.xDir = 1;
                    return;
                }

                console.log("RIGHT");
                let oldX = this.snake.xDir;
                this.snake.xDir = -this.snake.yDir;
                this.snake.yDir = -oldX;
            } else {
                console.log("FORWARD");
                // Straight
            }

            
            
            if (this.appleTraining) {  
                if (this.snake.dropCells[0]) {
                    if (this.lastData) {
                        console.log(appleDistance, this.lastData.lastAppleDistance)
                        if (appleDistance > this.lastData.lastAppleDistance) {
                            console.log("Apple got further away");
                            this.snake.gameOver = 1;
                            return;
                        }
        
                        this.lastData.blockage.push(this.lastData.lastAppleDistance);
                        this.net.activate(this.lastData.blockage);
                        this.net.propagate(0.3, [this.lastData.direction]);

                        this.lastData = null;
                    }
                    
                    this.lastData = {
                        blockage: blockage,
                        direction: direction,
                        lastAppleDistance: appleDistance
                    }
                }

                this.snake.updateLoopRate = 100000;
            } else {
                this.snake.updateLoopRate = 1;
            }
        }
    }

    ready() {
        if (!this.randomTraining) {
            this.fetchTrainingData().then(() => {
                this.net = new window.synaptic.Network.fromJSON(this.trainedData);;
            });

            if (this.appleTraining) {
                setTimeout(() => {
                    this.appleTraining = false;
                }, 6000);
            }
        } else {
            setTimeout(() => {
                console.log("Random Training Complete");
                this.randomTraining = false;
                this.appleTraining = true;

                setTimeout(() => {
                    this.appleTraining = false;
                }, 300000);
            }, 300000);
        }

        setInterval(() => {
            if (this.snake.gameOver > 0) {
                this.lastData = null;
                this.snake.gameOver = 0;
                this.snake.resetSnake();
            }
        }, 1);

        this.hookToGame();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const snake = new Snake();
    const neural = new NeuralNetwork(snake);
    snake.ready();
    neural.ready();

    window.snake = snake;
    window.neural = neural;
});