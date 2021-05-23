const grids_container = document.querySelector('.grids-container');
const grids_row = document.querySelectorAll('.grids-row');
const grids = document.querySelectorAll('.grid');
const counter = document.getElementById('counter');
const steps_interval = document.getElementById('steps-interval');

let active_grids = [];
let game_interval_time = 1000; // in millisecs
let step_count = 0;

const grids_x = 30;
const grids_y = 40;

let isPaused = true;

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

for (let rw = 0; rw < grids_x; rw++) {
  let row_elm = document.createElement('div');
  row_elm.classList.add('grids-row');

  for (let cl = 0; cl < grids_y; cl++) {
    let grid_elm = document.createElement('div');
    grid_elm.classList.add('grid');
    grid_elm.id = `${rw}-${cl}`;
    // grid_elm.innerHTML = `${rw}-${cl}`;
    grid_elm.setAttribute('onclick', 'selectGrid(event)');
    row_elm.appendChild(grid_elm);
  }

  grids_container.appendChild(row_elm);
}

const selectGrid = (event) => {
  let grid_id = event.target.id;
  addGrid(grid_id.toString());

  console.log(event.target.id);
};

const addGrid = (grid) => {
  let grid_ele = document.getElementById(grid);

  let coordinates = grid.split('-');
  let x = +coordinates[0];
  let y = +coordinates[1];

  if (!(x < 0 || y < 0)) {
    if (!active_grids.includes(grid)) {
      active_grids.push(grid);
      grid_ele.classList.add('activated');
    }
  }
};

const removeGrid = (grid) => {
  active_grids = active_grids.filter((ele) => {
    return ele != grid;
  });

  let grid_ele = document.getElementById(grid);
  grid_ele.classList.remove('activated');
};

const showActiveGrids = () => {
  console.log(active_grids);
};

const updateCounter = () => {
  //   console.log(step_count);
  counter.innerHTML = `${step_count}`;
};

const updateInterval = (value) => {
  game_interval_time = value;
  steps_interval.innerHTML = game_interval_time;
};

function updatePause() {
  isPaused = true;
}

const neighbourGrids = (grid) => {
  let coordinates = grid.split('-');
  let x = +coordinates[0];
  let y = +coordinates[1];

  let neighbour_grids = [];

  for (let idx = 0; idx < coordinate_coeff.length; idx++) {
    const elem = coordinate_coeff[idx];

    let x0 = x + elem[0];
    let y0 = y + elem[1];

    if (x0 < 0 || y0 < 0) {
      continue;
    }

    let grid_coord = String(`${x0}-${y0}`);

    neighbour_grids.push(grid_coord);
  }

  return neighbour_grids;
};

const neighbourActiveGrids = (grid) => {
  let neighbour_grids = neighbourGrids(grid);
  let neighbour_active_grids = [];

  neighbour_grids.forEach((elem) => {
    if (active_grids.includes(elem)) {
      neighbour_active_grids.push(elem);
    }
  });

  return neighbour_active_grids;
};

const neighbourPassiveGrids = (grid) => {
  let neighbour_grids = neighbourGrids(grid);
  let neighbour_passive_grids = [];

  neighbour_grids.forEach((elem) => {
    if (!active_grids.includes(elem)) {
      neighbour_passive_grids.push(elem);
    }
  });

  return neighbour_passive_grids;
};

const startGame = () => {
  isPaused = false;

  let gamePlayWInterval = setInterval(() => {
    gamePlay();
  }, game_interval_time);

  const gamePlay = () => {
    if (isPaused) {
      clearInterval(gamePlayWInterval);
    }

    for (let idx = 0; idx < active_grids.length; idx++) {
      const grid = active_grids[idx];

      const neighbour_active_grids = neighbourActiveGrids(grid);
      const neighbour_passive_grids = neighbourPassiveGrids(grid);

      // dead grids
      for (let idx = 0; idx < neighbour_passive_grids.length; idx++) {
        const gridx = neighbour_passive_grids[idx];

        if (neighbourActiveGrids(gridx).length == 3) {
          addGrid(gridx);
          break;
        }
      }

      // live grids
      if (neighbour_active_grids.length < 2) {
        removeGrid(grid);
        // continue;
      } else if ([2, 3].includes(neighbour_active_grids.length)) {
        // continue;
        null;
      } else if (neighbour_active_grids.length > 3) {
        removeGrid(grid);
        // continue;
      }
    }

    step_count += 1;
    updateCounter();
  };
};
