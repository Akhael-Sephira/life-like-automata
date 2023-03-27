
function World() {
    this.rows = 10;
    this.columns = 10;
    this.cells = [];
    this.mirrored = true;
    this.auto = false;
    
    this._rule = {
        'B': [3],
        'S': [2,3]
    };
    this._interval = null;
    this._intervalTime = 125;
    this._randomizeRatio = .5;

    this._events = {},

    this.reset();
}

World.EVENTS = {
    ON_SIZE_CHANGE: Symbol('size change'),
    ON_WORLD_UPDATE: Symbol('world update'),
    ON_CELL_UPDATE: Symbol('on cell update'),
}

World.Rules = {
    'Game of life': {
        'B': [3],
        'S': [2,3]
    },
    'Replicator': {
        'B': [1,3,5,7],
        'S': [1,3,5,7]
    },
    'Seeds': {
        'B': [2],
        'S': []
    },
    'Unamed': {
        'B': [2,5],
        'S': [4]
    },
    'Life without Death': {
        'B': [3],
        'S': [0,1,2,3,4,5,6,7,8]
    },
    '34 Life': {
        'B': [3,4],
        'S': [3,4]
    },
    'Diamoeba': {
        'B': [3,5,6,7,8],
        'S': [5,6,7,8]
    },
    '2x2': {
        'B': [3,6],
        'S': [1,2,5]
    },
    'HighLife': {
        'B': [3,6],
        'S': [2,3]
    },
    'Day & Night': {
        'B': [3,6,7,8],
        'S': [3,4,6,7,8]
    },
    'Morley': {
        'B': [3,6,8],
        'S': [2,4,5]
    },
    'Anneal': {
        'B': [4,6,7,8],
        'S': [3,5,6,7,8]
    }
} 

World.prototype = {

    /**
     * Rule of 
     */
    get rule() { return this._rule },
    /**
     * Ratio (float between 0 - 1) of alive cells when using the randomizeCells() function.
     */
    get randomizeRatio() { return this._randomizeRatio },
    set randomizeRatio(value) {
        let ratio = Number(value);
        if (isNaN(ratio)) return console.error(`'randomizeRatio' must be a number`);

        if (ratio > 1) ratio = 1;
        if (ratio < 0) ratio = 0;
        this._randomizeRatio = ratio;
    },

    /**
     * Interval of time in ms between updates in auto steps
     */
    get intervalTime() { return this._intervalTime; },
    set intervalTime(value) {
        const time = Number(value);
        if (isNaN(time)) return console.error(`'intervalTime' must be a number`);

        this._intervalTime = value;
        if (this._interval) {
            this.play();
        }
    },

    /**
     * Resets world
     * 
     * Triggers World.EVENTS.ON_WORLD_UPDATE
     */
    reset() {
        this.cells = [];
        // let totalCells = this.rows * this.columns;
        // for(let i = 0; i < totalCells; i++) {
        //     this.cells.push(new Cell(false));
        // }
        for(let y = 0; y < this.rows; y++) {
            for(let x = 0; x < this.columns; x++) {
                this.cells.push(new Cell(x, y, false));
            }
        }

        this.dispatch(World.EVENTS.ON_WORLD_UPDATE);
    },
    /**
     * Sets world size
     * 
     * Triggers World.EVENTS.ON_SIZE_CHANGE
     */
    setSize(size = {rows, columns}) {

        const old = this.cells;
        const updated = {};

        if ('rows' in size) { 
            if (this.rows != size.rows) {
                this.rows = size.rows; 
                updated.rows = size.rows;
            }
        }
        if ('columns' in size) { 
            if (this.columns != size.columns) {
                this.columns = size.columns; 
                updated.columns = size.columns;
            }
        }
        
        if (Object.keys(updated).length == 0) return;

        this.reset()

        old.forEach(cell => {
            if (cell.x < this.columns && cell.y < this.rows) {
                this.setCell(cell.x, cell.y, cell.alive);
            }
        })

        this.dispatch(World.EVENTS.ON_SIZE_CHANGE, updated);

    },
    /**
     * Gets cell at coor {x, y}
     */
    getCell(x, y) {
        const { cells, rows, columns, mirrored } = this;

        if (mirrored) {
            if (x >= columns) x = x % columns;
            if (y >= rows) y = y % rows;
            if (x < 0) x = (columns - 1) - (Math.abs(x + 1) % columns);
            if (y < 0) y = (rows - 1) - (Math.abs(y + 1) % rows);
        } else {
            if (x >= columns) return null;
            if (y >= rows) return null;
            if (x < 0) return null;
            if (y < 0) return null;
        }

        return cells[columns * y + x];
    },
    /**
     * Sets the state of the cell at coor {x, y}
     * 
     * Triggers World.EVENTS.ON_CELL_UPDATE
     */
    setCell(x, y, state) {
        const cell = this.getCell(x, y);
        if (state !== undefined) { cell.alive = state }
        else { cell.alive = !cell.alive }

        this.dispatch(World.EVENTS.ON_CELL_UPDATE, {x: x, y: y, alive: cell.alive});
    },
    /**
     * Randomizes all cells 
     * 
     * Uses this.randomizeRatio as the chances for each cell to be alive
     * 
     * Triggers World.EVENTS.ON_WORLD_UPDATE
     */
    randomizeCells() {
        const { cells } = this;
        cells.forEach(cell => { cell.alive = Math.random() < this.randomizeRatio });

        this.dispatch(World.EVENTS.ON_WORLD_UPDATE);
    },
    /**
     * Makes one step in time
     * 
     * Triggers World.EVENTS.ON_CELL_UPDATE each time a cell changes
     */
    applyRule() {
        const newWorld = [];
        const relativePos = [
            {x: -1, y: -1},
            {x: -1, y: 0},
            {x: -1, y: 1},
            {x: 0, y: -1},
            {x: 0, y: 1},
            {x: 1, y: -1},
            {x: 1, y: 0},
            {x: 1, y: 1},
        ]
        this.cells.forEach((cell, i) => {
            let aliveNeighbours = 0;
            relativePos.forEach(relPos => {
                if(this.getCell(cell.x + relPos.x, cell.y + relPos.y)?.alive) aliveNeighbours++;
            });

            let newState = false;

            // if (cell.alive) {
            //     if (aliveNeighbours == 2 || aliveNeighbours == 3) newState = true;
            // } else if (aliveNeighbours == 3) newState = true;
            if (cell.alive) {
                if (this.rule.S.includes(aliveNeighbours)) newState = true;
            } else { 
                if (this.rule.B.includes(aliveNeighbours)) newState = true;
            }

            let newCell = new Cell(cell.x, cell.y, newState);

            newWorld.push(newCell); 
            
            if (newState != cell.alive) {
                this.dispatch(World.EVENTS.ON_CELL_UPDATE, newCell);
            }
        });

        this.cells = newWorld;
    },
    /**
     * Start auto steps on an interval of this.intervalTime 
     */
    play() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        this._interval = setInterval(() => {this.applyRule()}, this.intervalTime);
        this.auto = true;
        this.applyRule();
    },
    /**
     * Stop auto steps
     */
    stop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
        this._interval = null;
        this.auto = false;
    },

    /**
     * Adds function to be called on event @param name
     */
    on(name, callback) {
        const { _events } = this;

        if (name in _events) _events[name].push(callback);
        else _events[name] = [callback]; 
    },
    /**
     * Invokes all the function with @param args associated to the triggered event
     */
    dispatch(name, args) {
        const { _events } = this;

        if (name in _events) _events[name].forEach(callback => callback(args));
    },
}











