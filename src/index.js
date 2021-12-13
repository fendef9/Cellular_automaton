'use strict'
class Cell {
    constructor(isDead = true) {
        this.isDead = isDead;
    }

    clone(){
      return new Cell(this.isDead);
    }

    kill() {
        if (!this.isDead) this.isDead = true;
    }

    resurrect() {
        if (this.isDead) this.isDead = false;
    }
}

class Colors  {
    constructor(){
        this.deadColor = `rgb(255, 255, 255)`
        this.aliveColor = `rgb(0, 0, 0)`
        this.borderColor = `rgb( 100, 100, 100)`
    }

    setColor = (isDead) => {
        return isDead ? this.deadColor : this.aliveColor;
    }
}

class AnimationFrame {
    constructor(fps = 60, animate) {
      this.requestID = 0;
      this.fps = fps;
      this.animate = animate;
    }

    stop() {
        cancelAnimationFrame(this.requestID);
      }
  
    start() {
      let then = performance.now();
      const interval = 1000 / this.fps;
      const tolerance = 0.1;
  
      const animateLoop = (now) => {
        this.requestID = requestAnimationFrame(animateLoop);
        const delta = now - then;
  
        if (delta >= interval - tolerance) {
          then = now - (delta % interval);
          this.animate(delta);
        }
      };
      this.requestID = requestAnimationFrame(animateLoop);
    }
  }

class Canvas {
    constructor(width, height, cellSize) {
        this.xCellsNumber = this.cellsNumber(width, cellSize);
        this.yCellsNumber = this.cellsNumber(height, cellSize);
        this.width = this.newCanvaSize(this.xCellsNumber, cellSize);
        this.height = this.newCanvaSize(this.yCellsNumber, cellSize);
        this.cellSize = cellSize;
    }

    cellsNumber (dimension, cellSize) {
        return Math.floor(dimension / cellSize);
    }

    newCanvaSize(cellsNumber, cellSize) {
        return cellsNumber * cellSize;
    }
}

class Matrix extends Canvas {
    constructor(width, height, initialValue, cellSize) {
        super(width, height, cellSize);
        this.matrix = this.#init(initialValue);
        this.live = [1, 3];
        this.born = [1, 8];
    }
    
    #init(initialValue) {
        const row = [];

        for (let i = 0; i < this.xCellsNumber; i++) {
            const column = [];

            for (let j = 0; j < this.yCellsNumber; j++) {
                column[j] = initialValue(i, j);
            }

            row[i] = column;
        }

        return row
    }

    static iterate(arr, callback = function(value, index, jndex) {}) {
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[0].length; j++) {
                callback(arr[i][j], i, j)
            }
        }

        return this;
    }

    findCellPosition(xCord, yCord) {
        const xIndex = this.cellsNumber(xCord, this.cellSize);
        const yIndex = this.cellsNumber(yCord, this.cellSize);
    
        return{
            xIndex,
            yIndex
        }
    }

    findCellCordinats(xIndex, yIndex) {
        const xCord = xIndex * this.cellSize;
        const yCord = yIndex * this.cellSize;
    
        return {xCord, yCord};
    }

    #findNeighbors(xIndex, yIndex, method) {
        let neighbors = 0;
        const count = method(xIndex, yIndex);

        for (let i = 0; i < count.length - 1; i += 2) {
            const x = count[i];
            const y = count[i + 1];
            
            if (
                x >= 0 && x < this.xCellsNumber &&   
                y >= 0 && y < this.yCellsNumber &&
                !this.matrix[x][y].isDead
            ) neighbors ++;
        }

        return neighbors;
    }

    clone() {
      const matrixCopy = this.#init((i, j) => {
          return this.matrix[i][j].clone();
      })

      return matrixCopy;
    }

    step(method, newMatrix) {
        Matrix.iterate(this.matrix, (val, i ,j) => {
            const neighborsCount = this.#findNeighbors(i, j, method);

            if (val.isDead !== newMatrix[i][j].isDead) {
              newMatrix.matrix[i][j].isDead = val.isDead;
            }

            if (
                !val.isDead  &&
                (neighborsCount > this.live[1] ||
                 neighborsCount < this.live[0])
            ) {
                newMatrix[i][j].kill();
            }
            if (
                val.isDead && 
                neighborsCount >= this.born[0] &&
                neighborsCount <= this.born[1]
            ) {
                newMatrix[i][j].resurrect();
            }
            
            return
        })
        
        return this
    }
}

const canvas = document.getElementById(`screen`);
const screenWrapper = document.getElementById(`screen-wrapper`);
const startStop = document.getElementById(`start`);
const initWidth = screenWrapper.clientWidth
const initHeight = screenWrapper.clientHeight;
const ctx = canvas.getContext(`2d`);
const CAGE_SIZE = 8;
const BORDE_WIDTH = 1;
const initialCell = () => new Cell();
const matrix = new Matrix(initWidth, initHeight, initialCell, CAGE_SIZE);
const colors = new Colors();
const animationFrame = new AnimationFrame();

let live = [2, 3];
let born = [3, 3];
const mooreNeighborhood = (xIndex = 0 , yIndex = 0) => {
  // 012
  // 3C5
  // 678

  return [
      xIndex - 1, yIndex - 1,   // 0
      xIndex, yIndex - 1,       // 1
      xIndex + 1, yIndex - 1,   // 2
      xIndex - 1, yIndex,       // 3         
                                // 4
      xIndex + 1, yIndex,       // 5
      xIndex - 1, yIndex + 1,   // 6
      xIndex, yIndex + 1,       // 7
      xIndex + 1, yIndex + 1,   // 8
  ]
}

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

ctx.canvas.height = matrix.height;
ctx.canvas.width = matrix.width;
ctx.imageSmoothingEnabled = false;
ctx.lineWidth = BORDE_WIDTH;
ctx.strokeStyle = colors.borderColor;
ctx.fillStyle = colors.deadColor;

const drawlogic = (isInit, newMatrix) => { 
  return (value, i, j) => {
    const {xCord: x, yCord: y} = matrix.findCellCordinats(i, j);
    const oldMatrixValue = matrix.matrix[i][j];
    
    if (!isInit && oldMatrixValue.isDead === value.isDead) return

    ctx.fillStyle = colors.setColor(value.isDead);
    ctx.strokeRect(x, y, matrix.cellSize, matrix.cellSize);
    ctx.fillRect(
        x + BORDE_WIDTH, 
        y + BORDE_WIDTH, 
        matrix.cellSize - BORDE_WIDTH * 2, 
        matrix.cellSize - BORDE_WIDTH * 2
    );
  }
}

const draw = (event) => {
    let isDead;
    const {xIndex: x, yIndex: y} = matrix.findCellPosition(event.offsetX, event.offsetY);
    const cell = matrix.matrix[x][y];
    
    switch(event.which) {
        case 1:
            isDead = false
            break;
        case 3:
            isDead = true;
            break;
        default:
           return  
    }   

    if(cell.isDead !== isDead) {
        matrix.matrix[x][y].isDead = isDead;
        drawlogic(true)(matrix.matrix[x][y], x, y);
    }
}

const startDraw = (event) => {
    draw(event);
    canvas.addEventListener(`mousemove`, draw);      
}

const stopDraw = () => {
    canvas.removeEventListener(`mousemove`, draw); 
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', stopDraw);

const animate = () => {
  console.time(`1`);
  const newMatrix = matrix.clone();
  matrix.step(mooreNeighborhood, newMatrix);
  Matrix.iterate(newMatrix, drawlogic(false));
  matrix.matrix = newMatrix;
  console.timeEnd(`1`)
}

const start = () => {
    let isPaused = false;

    animationFrame.animate = animate;

    return () => {
        isPaused = !isPaused;

        if (isPaused) animationFrame.start();
        else animationFrame.stop();
    }
}

startStop.addEventListener(`click`, start());

Matrix.iterate(matrix.matrix, drawlogic(true));
