'use strict'
class cells {
    constructor(color = `white`) {
        this.color = color;
        this.isDead = color === `white` ? true : false;
    }

    complementaryPairs = {
        black: [`black`, `white`],
        white: [`white`, `black`]
    }

    switchPair() {
        this.color = this.complementaryPairs[color][!this.isDead];
    }

    makeDead() {
        this.isDead = true;
        this.switchPair();
    }

    makeAlive() {
        this.isDead = false;
        this.switchPair();
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
    }
    
    #init(initialValue) {
        const row = [];

        for (let i = 0; i < this.xCellsNumber; i++) {
            const column = [];

            for (let j = 0; j < this.yCellsNumber; j ++) {
                column[j] = initialValue;
            }

            row[i] = column;
        }

        return row
    }

    iterate(callback = function(value, index, jndex) {}) {
        for (let i = 0; i < this.xCellsNumber; i++) {
            for (let j = 0; j < this.yCellsNumber; j ++) {
                callback(this.matrix[i][j], i, j)
            }
        }

        return this.matrix;
    }

    twoDintoOneD(xIndex, yIndex) {
        return yIndex * this.xCellsNumber + xIndex;
    }

    oneDintoTwoD(index) {
        return {
            xIndex:  this.xCellsNumber - index, // проблема тут
            yIndex: this.cellsNumber(this.xCellsNumber, index),
        }
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

    mooreNeighborhood(xIndex = 0 , yIndex = 0) {
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

    #findNeighbors(val, xIndex, yIndex, method) {
        let neighbors = 0;
        const count = method(xIndex, yIndex);
            
        for (let i = 0; i < count.length - 1; i += 2) {
            const x = count[i];
            const y = count[i + 1];
                
            if (x < 0 || y < 0) {
                continue
            } else if (this.matrix[x][y] === `black`) {
                neighbors ++;
            }
        }

        return neighbors;
    }

    step(live = [], born, method) {
        this.iterate( (val, i ,j) => {
            const neighborsCount = this.#findNeighbors(val, i, j, method);

            if (
                val === `black` &&
                (neighborsCount > live[1] ||
                neighborsCount < live[0])
            ) {
                this.matrix[i] = `white`;
            }
            if (val === `white` && neighborsCount === born) {
                this.matrix[i] = `black`;
            }
            
            return
        })
    }
}

const canvas = document.getElementById(`screen`);
const wrapper = document.getElementById(`screen-wrapper`);
const initWidth = wrapper.clientWidth
const initHeight = wrapper.clientHeight;
const ctx = canvas.getContext(`2d`);
const CAGE_SIZE = 64;
const BORDE_WIDTH = 1;
const matrix = new Matrix(initWidth, initHeight, `white`, CAGE_SIZE);

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

ctx.canvas.height = matrix.height;
ctx.canvas.width = matrix.width;
ctx.imageSmoothingEnabled = false;
ctx.lineWidth = BORDE_WIDTH;
ctx.strokeStyle = `grey`;
ctx.fillStyle = `white`;

const drawlogic = (ctx, matrix) => {
    return (value, i, j) => {
        const {xCord: x, yCord: y} = matrix.findCellCordinats(i, j);

        ctx.fillStyle = value;
        ctx.strokeRect(x, y, matrix.cellSize, matrix.cellSize);
        ctx.fillRect(
            x + BORDE_WIDTH, 
            y + BORDE_WIDTH, 
            matrix.cellSize - BORDE_WIDTH * 2, 
            matrix.cellSize - BORDE_WIDTH * 2
        );
    }
}

matrix.iterate(drawlogic(ctx, matrix));

const draw = (event) => {
    let drawColor;
    const {xIndex: x, yIndex: y} = matrix.findCellPosition(event.offsetX, event.offsetY);
    const color = matrix.matrix[x][y];
    
    switch(event.which) {
        case 1:
            drawColor = `black`;
            break;
        case 3:
            drawColor = `white`;
            break;
        default:
           return  
    }   
    if(color !== drawColor) {
        drawlogic(ctx, matrix)(drawColor, x, y);
        matrix.matrix[x][y] = drawColor;
    }
}

const startDraw = (event) => {
    draw(event);
    canvas.addEventListener(`mousemove`, draw);      
}

const stopDraw = (event) => {
    canvas.removeEventListener(`mousemove`, draw); 
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', stopDraw);
