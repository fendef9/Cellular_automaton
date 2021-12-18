// 'use strict'
// var stats = new Stats();
// stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

class Colors {
  constructor() {
    this.deadColor = `rgb(255, 255, 255)`
    this.aliveColor = `rgb(0, 0, 0)`
    this.borderColor = `rgb( 100, 100, 100)`
  }

  setColor = (isDead) => {
    return isDead ? this.aliveColor : this.deadColor ;
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
        // stats.begin();

        this.animate(delta);

        // stats.end();
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

  cellsNumber(dimension, cellSize) {
    return Math.floor(dimension / cellSize);
  }

  newCanvaSize(cellsNumber, cellSize) {
    return cellsNumber * cellSize;
  }
}

class Matrix extends Canvas {
  constructor(width, height, cellSize, initialValue = 0) {
    super(width, height, cellSize);
    this.live = [1, 3];
    this.born = [1, 8];
    this.length = this.xCellsNumber * this.yCellsNumber;
    this.matrix = new Array(this.length).fill(initialValue);
  }

  findCellPosition(xCord, yCord) {
    const xIndex = this.cellsNumber(xCord, this.cellSize);
    const yIndex = this.cellsNumber(yCord, this.cellSize);
    const index = yIndex * this.xCellsNumber + xIndex

    return index;
  }

  findCellCordinats(index) {
    const yIndex = this.cellsNumber(index, this.xCellsNumber);
    const xIndex = index - yIndex * this.xCellsNumber;
    const xCord = xIndex * this.cellSize;
    const yCord = yIndex * this.cellSize;

    return { xCord, yCord };
  }

  findNeighbors(index, method) {
    let neighbors = 0;
    const count = method(index);

    count.forEach((value) => {
      if (
        index >= 0 && index < this.length &&
        this.matrix[index]
      ) neighbors++;
    })

    return neighbors;
  }

  step(method, newMatrix) {
    this.matrix.forEach((val, i) => {
      const neighborsCount = this.findNeighbors(i, method);

      if (val === newMatrix[i]) return
      else {
        if (
          !val &&
          (neighborsCount > this.live[1] ||
            neighborsCount < this.live[0])
        ) newMatrix[index] = 0;
        else if (
          val &&
          neighborsCount >= this.born[0] &&
          neighborsCount <= this.born[1]
        ) newMatrix[i] = 1;
      }
    })
  }
}

const canvas = document.getElementById(`screen`);
const screenWrapper = document.getElementById(`screen-wrapper`);
const startStop = document.getElementById(`start`);
const fpsCounter = document.getElementById(`fps`); 
const initWidth = screenWrapper.clientWidth;
const initHeight = screenWrapper.clientHeight;

const CAGE_SIZE = 128;
// const BORDE_WIDTH = 1;
const matrix = new Matrix(initWidth, initHeight, CAGE_SIZE, 0);
// const colors = new Colors();
const animationFrame = new AnimationFrame();

const mooreNeighborhood = (index) => {
  return [
    index - 4,
    index - 3,
    index - 2,
    index - 1,
    index + 1,
    index + 2,
    index + 3,
    index + 4
  ]
}

canvas.addEventListener('contextmenu', (event) => event.preventDefault());

// const draw = (event) => {
//   let isDead;
//   const { xIndex: x, yIndex: y } = matrix.findCellPosition(event.offsetX, event.offsetY);
//   const cell = matrix.matrix[x][y];

//   switch (event.which) {
//     case 1:
//       isDead = false
//       break;
//     case 3:
//       isDead = true;
//       break;
//     default:
//       return
//   }

//   if (cell.isDead !== isDead) {
//     matrix.matrix[x][y].isDead = isDead;
//     drawlogic(true)(matrix.matrix[x][y], x, y);
//   }
// }

// const startDraw = (event) => {
//   draw(event);
//   canvas.addEventListener(`mousemove`, draw);
// }

// const stopDraw = () => {
//   canvas.removeEventListener(`mousemove`, draw);
// }

// canvas.addEventListener('mousedown', startDraw);
// canvas.addEventListener('mouseup', stopDraw);

// const animate = () => {
//   console.time(`1`);
//   const newMatrix = matrix.clone();
//   matrix.step(mooreNeighborhood, newMatrix);
//   Matrix.iterate(newMatrix);
//   matrix.matrix = newMatrix;
//   console.timeEnd(`1`)
// }

// const start = () => {
//   let isPaused = false;

//   animationFrame.animate = (dt) => {
//     fpsCounter.innerText = `FPS: ${Math.floor(1000 / dt)}`

//   };

//   return () => {
//     isPaused = !isPaused;

//     if (isPaused) animationFrame.start();
//     else animationFrame.stop();
//   }
// }

// startStop.addEventListener(`click`, start());

const setViewport = (gl, canvas) => {
  gl.viewport(0, 0, canvas.width, canvas.height);
}

const initWebGL = (canvas) => {
  let gl = null;

  try {
    // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
    gl = canvas.getContext(`webgl2`, {alpha: false, depth: false, antialising: false});
  }
  catch (e) { }

  // Если мы не получили контекст GL, завершить работу
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  return gl;
}

const start = (canvas) => {
  let gl = initWebGL(canvas);      // инициализация контекста GL

  // продолжать только если WebGL доступен и работает

  if (gl) {
    setViewport(gl, canvas);
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

  }

  return gl;
}

const getShader = (gl, id) => {
  const shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  let theSource = "";
  let currentChild = shaderScript.firstChild;

  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }

    currentChild = currentChild.nextSibling;
  }

  return theSource;
}

const compileProgram = ({ vertexShader, fragmentShader }) => {
  // Compile vertex shader
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertexShader);
  gl.compileShader(vs);

  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vs));
		return;
	}

  // Compile fragment shader
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragmentShader);
  gl.compileShader(fs);

  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fs));
		return;
	}

  // Create and launch the WebGL program
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);

	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

  return program;
};

canvas.height = matrix.height;
canvas.width = matrix.width;

const gl = start(canvas);
const program = compileProgram({
  vertexShader: getShader(gl, `vertex-shader-2d`),
  fragmentShader: getShader(gl, `fragment-shader-2d`)
})

gl.useProgram(program);

const a_position = gl.getAttribLocation(program, "a_position");
const a_color = gl.getAttribLocation(program, "a_color");
const u_resolution = gl.getUniformLocation(program, "u_resolution");
const u_size = gl.getUniformLocation(program, "u_size");

// Create a buffer to put positions in
const positionBuffer = gl.createBuffer();

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);



const strt = () => {
  let isPaused = false;

  animationFrame.animate = (dt) => {
    fpsCounter.innerText = `FPS: ${Math.floor(1000 / dt)}`

    let arr =[]
  
for (let i = 8; i <= matrix.width; i += 16) {
  for(let j = 8; j<=matrix.height; j += 16) {
    arr.push(i);
    arr.push(j);
  }
}

const points = new Float32Array(arr)



gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW)

gl.uniform1f(u_size, 14);
gl.uniform2f(u_resolution, canvas.width, canvas.height)
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

gl.enableVertexAttribArray(a_position);
// gl.enableVertexAttribArray(u_resolution);
// gl.enableVertexAttribArray(u_size);

gl.drawArrays(gl.POINTS, 0, arr.length);

  };
  return () => {
    isPaused = !isPaused;

    if (isPaused) animationFrame.start();
    else animationFrame.stop();
  }
}

startStop.addEventListener(`click`, strt());