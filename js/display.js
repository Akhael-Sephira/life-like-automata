
function Display(world, canvas) {
    this.world = world;
    this.canvas = canvas;

    this.cellGap = 0.1;
    this.colors = {
        alive: 'white',
        dead: 'black'
    };
    this.downFlag = { 
        status: false, 
        coor: null, 
        alive: false 
    };
    this.lastCellCoor = null;

    this.ctx = this.canvas.getContext("2d");

    this.__init();
}

Display.prototype = {

    __init() {
        const { world, canvas } = this;

        this.updateSizes();
        this.drawEverything();

        // Set World Events
        world.on(World.EVENTS.ON_WORLD_UPDATE, () => { this.drawEverything(); });
        world.on(World.EVENTS.ON_CELL_UPDATE, (cell) => { this.drawCell(cell); });
        world.on(World.EVENTS.ON_SIZE_CHANGE, (updated) => { 
    
            if (!('columns' in updated)) return;
    
            this.updateSizes(); 
            this.drawEverything(); 
        });
    
        // Set Click Events
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        canvas.addEventListener('pointerdown', (e) => {
            this.downFlag.status = true;

            const x = Math.floor(e.offsetX / (this.sizes.rect.width / this.world.columns));
            const y = Math.floor(e.offsetY / (this.sizes.rect.height / this.world.rows));
    
            this.downFlag.coor = {x:x,y:y};

            this.downFlag.alive = world.getCell(x, y).alive;
            world.setCell(x, y);
        });
        canvas.addEventListener('pointerup', (e) => {
            this.downFlag.status = false;
            this.downFlag.coor = null;
        });
        canvas.addEventListener('pointermove', (e) => {
    
            if (!this.downFlag.status) return;

            const x = Math.floor(e.offsetX / (this.sizes.rect.width / this.world.columns));
            const y = Math.floor(e.offsetY / (this.sizes.rect.height / this.world.rows));
    
            if (this.downFlag.coor.x !== x || this.downFlag.coor.y !== y) {
                this.downFlag.coor = {x:x,y:y};
                world.setCell(x, y, !this.downFlag.alive);
            }
        });

        // Set Window Events
    
        let resizeTimeOut = null;
        window.addEventListener('resize', (e) => {
            clearInterval(resizeTimeOut); 
            resizeTimeOut = setTimeout(() => {
                this.updateSizes();
                this.drawEverything();
            }, 250)
        });

    },
    /**
     * Clear the canvas & redraw each cell
     */
    drawEverything() { 
        const { ctx, world, colors } = this;
        const { cell } = this.sizes;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let x = 0; x < world.columns; x++) {
            for (let y = 0; y < world.rows; y++) {
                ctx.fillStyle = world.getCell(x, y).alive ? colors.alive : colors.dead;
                ctx.fillRect(
                    x * cell.width, y * cell.height,
                    cell.width, cell.height
                );
            }
        }
    },
    /**
     * Draw given cell
     */
    drawCell(cell) {
        const { ctx, colors, sizes } = this;

        ctx.fillStyle = cell.alive ? colors.alive : colors.dead;

        const posX = cell.x * sizes.cell.width;
        const posY = cell.y * sizes.cell.height;
        const sizeX = sizes.cell.width;
        const sizeY = sizes.cell.height;

        ctx.fillRect(posX, posY, sizeX, sizeY);
    },
    /**
     * Update canvas sizes
     */
    updateSizes() {
        const rect = this.canvas.getBoundingClientRect();
        const { world, canvas } = this;

        const cellSize = Math.ceil(rect.width / world.columns);
        const nbRows = Math.ceil(rect.height / cellSize);
        world.setSize({rows:nbRows});

        this.sizes = {};
        this.sizes.rect = {width: rect.width, height: rect.height};
        this.sizes.cell = {width: cellSize, height: cellSize};

        canvas.width = world.columns * cellSize;
        canvas.height = world.rows * cellSize;
    },
    /**
     * Change colors & redraw
     */
    setColors(colors = { alive, dead }) {
        if ('alive' in colors) { this.colors.alive = colors.alive; }
        if ('dead' in colors) { this.colors.dead = colors.dead; }
        this.drawEverything();
    }
}
