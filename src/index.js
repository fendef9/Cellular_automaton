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
        this.length = this.yCellsNumber * this.xCellsNumber;
        this.matrix = this.#init(initialValue);
    }
    
    #init(initialValue) {
        const arr = [];
        arr.length = this.length;
        arr.fill(initialValue);

        return arr;
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
    
        return this.twoDintoOneD(xIndex, yIndex);
    }

    findCellCordinats(index) {
        const {xIndex, yIndex} = this.oneDintoTwoD(index);
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

    #findNeighbors(val, i, method) {
        let neighbors = 0;
        const {xIndex, yIndex} = this.oneDintoTwoD(i);
        const count = method(xIndex, yIndex);
            
        for (let i = 0; i < count.length - 1; i += 2) {
            const brother = this.twoDintoOneD(count[i], count[i + 1]);
                
            if (brother < 0) {
                continue
            } else if (this.matrix[brother] === `black`) {
                neighbors ++;
            }
        }

        return neighbors;
    }

    step(live = [], born, method) {
        this.matrix.forEach( (val, i) => {
            const neighborsCount = this.#findNeighbors(val, i, method);

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
console.log(matrix.findCellCordinats(20))

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

ctx.canvas.height = matrix.height;
ctx.canvas.width = matrix.width;
ctx.imageSmoothingEnabled = false;
ctx.lineWidth = BORDE_WIDTH;
ctx.strokeStyle = `grey`;
ctx.fillStyle = `white`;

// const drawlogic = (ctx) => {
//     return (value, i) => {
//         const {xCord: x, yCord: y} = matrix.findCellCordinats(i);
//         ctx.fillStyle = value;
//         ctx.strokeRect(x, y, matrix.cellSize, matrix.cellSize);
//         ctx.fillRect(
//             x + BORDE_WIDTH, 
//             y + BORDE_WIDTH, 
//             matrix.cellSize - BORDE_WIDTH * 2, 
//             matrix.cellSize - BORDE_WIDTH * 2
//         );
//     }
// }

// // matrix.matrix.forEach(drawlogic(ctx));

// const draw = (event) => {
//     let drawColor;
//     const index = matrix.findCellPosition(event.offsetX, event.offsetY, width, CAGE_SIZE);
//     const color = initCellsArray[index];
    
//     switch(event.which) {
//         case 1:
//             drawColor = `black`;
//             break;
//         case 3:
//             drawColor = `white`;
//             break;
//         default:
//            return  
//     }   
//     // if(color !== drawColor) {
//     //     drawlogic(ctx, CAGE_SIZE)(drawColor, x, y);
//     //     initCellsArray[x][y] = drawColor;
//     // }
// }

// const startDraw = (event) => {
//     draw(event);
//     canvas.addEventListener(`mousemove`, draw);
//     // prompt(event.which);       
// }

// const stopDraw = (event) => {
//     canvas.removeEventListener(`mousemove`, draw); 
// }

// canvas.addEventListener('mousedown', startDraw);
// canvas.addEventListener('mouseup', stopDraw);
