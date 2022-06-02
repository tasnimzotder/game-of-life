const grid_container = document.querySelector('.grids-container');
const grid_row = document.querySelectorAll('.grids-row');
const cells = document.querySelectorAll('.grid');
const counter = document.getElementById('counter');
const steps_interval = document.getElementById('steps-interval');
const play_pause = document.getElementById('play-pause');
const active_cells_counter = document.getElementById('active-cells');

// global variables
let active_cells = [];
let game_interval_time = +250; // in milliseconds

// grid height(y) & width(x)
let grid_x = 128;
let grid_y = 128;

// game status
let isPaused = false;
let step_count = 0;

// neighbor cells coordinates
const coordinate_coeff = [
  [0, 1], //top
  [1, 1], //top-right
  [1, 0], //right
  [1, -1], //bottom-right
  [0, -1], //bottom
  [-1, -1], //bottom-left,
  [-1, 0], //left
  [-1, 1], //top-left
];

function updateActiveCells() {
  let count = active_cells.length;
  active_cells_counter.innerHTML = `${count}`;
}

class Grid {
  constructor() {
    this.generateGridCells(grid_x, grid_y);
  }

  // generate the grid cells
  generateGridCells(height, width) {
    for (let rw = 0; rw < width; rw++) {
      let row_elm = document.createElement('div');
      row_elm.classList.add('grids-row');

      for (let cl = 0; cl < height; cl++) {
        let grid_elm = document.createElement('div');
        grid_elm.classList.add('grid');
        grid_elm.id = `${rw}-${cl}`;
        // grid_elm.innerHTML = `${rw}-${cl}`;
        grid_elm.setAttribute('onclick', 'selectCell(event)');
        row_elm.appendChild(grid_elm);
      }

      grid_container.appendChild(row_elm);
    }
  }

  addCell(cell_id) {
    let cell = document.getElementById(cell_id);

    let coordinates = cell_id.split('-');
    let x = +coordinates[0];
    let y = +coordinates[1];

    if (!(x < 0 || y < 0)) {
      if (!active_cells.includes(cell_id)) {
        active_cells.push(cell_id);
        cell.classList.add('activated');
      }
    }
  }

  removeCell(cell_id) {
    active_cells = active_cells.filter((ele) => {
      return ele !== cell_id;
    });

    let cell = document.getElementById(cell_id);
    cell.classList.remove('activated');
  }

  neighborCells(cell_id) {
    let coordinates = cell_id.split('-');
    let x = +coordinates[0];
    let y = +coordinates[1];

    let neighbor_cells = [];

    for (let idx = 0; idx < coordinate_coeff.length; idx++) {
      const elem = coordinate_coeff[idx];

      let x0 = x + elem[0];
      let y0 = y + elem[1];

      if (x0 < 0 || y0 < 0) {
        continue;
      }

      let grid_coord = String(`${x0}-${y0}`);

      neighbor_cells.push(grid_coord);
    }

    return neighbor_cells;
  }

  neighborActiveCells(cell_id) {
    let neighbor_cells = this.neighborCells(cell_id);
    let neighbor_active_cells = [];

    neighbor_cells.forEach((cell) => {
      if (active_cells.includes(cell)) {
        neighbor_active_cells.push(cell);
      }
    });

    return neighbor_active_cells;
  }

  neighborPassiveCells(cell_id) {
    let neighbor_cells = this.neighborCells(cell_id);
    let neighbor_passive_cells = [];

    neighbor_cells.forEach((cell) => {
      if (!active_cells.includes(cell)) {
        neighbor_passive_cells.push(cell);
      }
    });

    return neighbor_passive_cells;
  }
}



class Game extends Grid {
  constructor() {
    super();
    this.gamePlayVar = null;
    this.game_status = false;
  }

  // game logics
  gamePlay() {
    let currActiveCells = [];
    let currPassiveGrids = [];

    for (let idx = 0; idx < active_cells.length; idx++) {
      const grid = active_cells[idx];

      if (super.neighborActiveCells(grid).length < 2) {
        // 1. Any live grid cell w/ less than 2 live neighbors dies

        currPassiveGrids.push(grid);
      } else if ([2, 3].includes(super.neighborActiveCells(grid).length)) {
        // 2. Any live grid cell w/ 2 or 3 live neighbors lives

        currActiveCells.push(grid);
      } else if (super.neighborActiveCells(grid).length > 3) {
        // 3. Any live grid cell w/ more than 3 live neighbors dies

        currPassiveGrids.push(grid);
      }

      super.neighborPassiveCells(grid).forEach((grid_p) => {
        // 4. Any dead grid cell w/ exactly 3 live neighbors becomes live

        if (super.neighborActiveCells(grid_p).length == 3) {
          currActiveCells.push(grid_p);
        }
      });
    }

    currPassiveGrids.forEach((grid_p) => {
      super.removeCell(grid_p);
    });

    currActiveCells.forEach((grid_a) => {
      super.addCell(grid_a);
    });

    if (currPassiveGrids.length == 0) {
      if (
        arrayMatch(active_cells, currActiveCells) ||
        active_cells.length == 0
      ) {
        clearInterval(this.gamePlayVar);

        this.game_status = false;
      }
    }

    if (this.game_status) {
      step_count += 1;
      updateCounter();
    }
    updateActiveCells();
  }

  // start/play the game
  start() {
    clearInterval(this.gamePlayVar);
    this.game_status = true;

    this.gamePlayVar = setInterval(() => {
      this.gamePlay();
    }, game_interval_time);
  }

  // pause the game
  pause() {
    clearInterval(this.gamePlayVar);
    this.game_status = false;
  }

  // reset the game
  reset() {
    clearInterval(this.gamePlayVar);

    step_count = 0;
    this.game_status = false;

    updateInterval(+250);
    updateCounter();

    active_cells.map((cell) => {
      super.removeCell(cell);
    });
  }
}

const selectCell = (event) => {
  const cell_id = event.target.id;
  game.addCell(cell_id);
};

const updateCounter = () => {
  //   console.log(step_count);
  counter.innerHTML = `${step_count}`;
};

const updateInterval = (value) => {
  game_interval_time = value;
  steps_interval.innerHTML = game_interval_time;

  if (game.game_status) {
    game.pause();
    game.start();
  }

  let interval_range = document.getElementById('interval-range');
  interval_range.value = game_interval_time;
};

const arrayMatch = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  for (let idx = 0; idx < arr1.length; idx++) {
    if (arr1[idx] !== arr2[idx]) {
      return false;
    } else {
      return true;
    }
  }
};

// initiate the game
let game = new Game();
// let grid = new Grid();

const handleGame = (ctrl) => {
  if (ctrl == 'start') {
    game.start();
  } else if (ctrl == 'play-pause') {
    if (isPaused) {
      isPaused = false;
      play_pause.innerHTML = 'Pause';

      game.start();
    } else {
      isPaused = true;
      play_pause.innerHTML = 'Play';

      game.pause();
    }
  } else if (ctrl == 'reset') {
    game.reset();
  }
};
