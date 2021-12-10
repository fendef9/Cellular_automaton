'use strict'
const canva = document.getElementById(`screen`);
const wrapper = document.getElementById(`screen-wrapper`);
const initWidth = wrapper.clientWidth
const initHeight = wrapper.clientHeight;
const ctx = canva.getContext(`2d`);
const CAGE_SIZE = 64;
const BORDE_WIDTH = 1;

canva.addEventListener('contextmenu', (event) => event.preventDefault());

// найти количество клеток по определенной оси
const сellsNumber = (dimension, cellSize) => Math.floor(dimension / cellSize);
// найти новую ширину канвы по определенной оси
const newCanvaSize = (сellsNumber, cellSize) => сellsNumber * cellSize;

const findCellPosition = (xCord, yCord, cellSize) => {
    const xIndex = сellsNumber(xCord, cellSize);
    const yIndex = сellsNumber(yCord, cellSize);

    return {xIndex, yIndex};
}

const findCellCordinats = (xIndex, yIndex, cellSize) => {
    const xCord = xIndex * cellSize;
    const yCord = yIndex * cellSize;

    return {xCord, yCord};
}

class Matrix {
    constructor(x, y, initialValue) {
        this.x = x;
        this.y = y;
        this.matrix = this.#initMatrix(initialValue);
    }

    #initMatrix(initialValue) {
        const row = [];

        for (let i = 0; i < this.x; i++) {
            const column = [];
            
            for (let j = 0; j < this.y; j ++) {
                column[j] = initialValue;
            }

            row[i] = column;
        }
    
        return row
    }
    
    iterate(callback = function(value, index, jndex) {}) {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[0].length; j ++) {
                callback(this.matrix[i][j], i, j)
            }
        }

        return this.matrix;
    }

    #mooreNeighborhood(xIndex, yIndex) {
        // 012
        // 3C5
        // 678

        return [
            xIndex - 1, yIndex - 1,   // 0
            xIndex, yIndex - 1,       // 1
            xIndex + 1, yIndex - 1,   // 2
            xIndex - 1, yIndex,       // 3
            xIndex, yIndex,           // 4
            xIndex + 1, yIndex,       // 5
            xIndex - 1, yIndex + 1,   // 6
            xIndex, yIndex + 1,       // 7
            xIndex + 1, yIndex + 1,   // 8
        ]
    }

    #findNeighbors(method) {
        const neighborsCount = this.#initMatrix(0);
        let neighbors = 0;
        
        this.iterate( (val, i, j) => {
            let count = method(i, j);
            
            for (let i = 0; i < count.length - 1; i += 2) {
                if(this.matrix[val[i]][val[i + 1]] === val) {
                    neighbors ++;
                }
            }
    
            neighborsCount[i][j] = neighbors;
        })

        return neighborsCount;
    }

    step(live, born) {
        
    }

}

const xLength = сellsNumber(initWidth, CAGE_SIZE);
const yLength = сellsNumber(initHeight, CAGE_SIZE);
const height = ctx.canvas.height = newCanvaSize(yLength, CAGE_SIZE);
const width = ctx.canvas.width = newCanvaSize(xLength, CAGE_SIZE);

ctx.imageSmoothingEnabled = false;
ctx.lineWidth = BORDE_WIDTH;
ctx.strokeStyle = `grey`;
ctx.fillStyle = `white`;

const drawlogic = (ctx, cellSize) => {
    return (value, i, j) => {
        const {xCord: x, yCord: y} = findCellCordinats(i, j, cellSize);
        
        ctx.fillStyle = value;
        ctx.strokeRect(x, y, cellSize, cellSize);
        ctx.fillRect(
            x + BORDE_WIDTH, 
            y + BORDE_WIDTH, 
            cellSize - BORDE_WIDTH * 2, 
            cellSize - BORDE_WIDTH * 2
        );
    }
}

let initCellsArray = new Matrix(xLength, yLength, `white`)
    .iterate(drawlogic(ctx, CAGE_SIZE));

const draw = (event) => {
    let drawColor;
    const {xIndex: x, yIndex: y} = findCellPosition(event.offsetX, event.offsetY, CAGE_SIZE);
    const color = initCellsArray[x][y];
    
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
        drawlogic(ctx, CAGE_SIZE)(drawColor, x, y);
        initCellsArray[x][y] = drawColor;
    }
}

const startDraw = (event) => {
    draw(event);
    canva.addEventListener(`mousemove`, draw);
    // prompt(event.which);       
}

const stopDraw = (event) => {
    canva.removeEventListener(`mousemove`, draw); 
}

canva.addEventListener('mousedown', startDraw);
canva.addEventListener('mouseup', stopDraw);
