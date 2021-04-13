CELL_SIZE = 30
GAP = 1
WIDTH = 8
HEIGHT = 8
CANVAS_WIDTH = CELL_SIZE * WIDTH
CANVAS_HEIGHT = CELL_SIZE * HEIGHT
BASE_COLOR = 'lightgray'
BLACK_COLOR = 'black'
WHITE_COLOR = 'white'


window.addEventListener('load', () => {
    const controller = new Controller()
});

const Model = class {
    constructor() {
        this.cells = Array(HEIGHT).fill().map(() => Array(WIDTH).fill(0));
        this.turn = 1 // 黒
        this.message = `${this.turn > 0 ? '黒': '白'}のターンです。`
        this.init()
    }
    init() {
        this.changeDisk(3, 3, -1);
        this.changeDisk(3, 4, 1);
        this.changeDisk(4, 3, 1);
        this.changeDisk(4, 4, -1);
    }
    changeDisk(x, y, color) {
        this.cells[y][x] = color;
    }
    nextTurn() {
        this.turn *= -1;
        this.message = `${this.turn > 0 ? '黒': '白'}のターンです。`;
    }
}

const View = class {
    // モデルの値を読んでレンダリング
    constructor(ctx, model, info) {
        this.ctx = ctx;
        this.model = model;
        this.info = info;
        this.init();
    }
    init() {
        // 盤面の作成
        this.ctx.fillStyle = BASE_COLOR;
        for(let i = 0; i < WIDTH; i++) {
            for(let j = 0; j < HEIGHT; j++) {
                this.ctx.fillRect(j * CELL_SIZE + GAP, i * CELL_SIZE + GAP, CELL_SIZE - GAP * 2, CELL_SIZE - GAP * 2);
            }
        }
        this.render();
    }
    render() {
        // info
        this.info.innerText = this.model.message;

        // diskの情報を反映
        for (let i = 0; i < WIDTH; i++) {
            for (let j = 0; j < HEIGHT; j++) {
                const color = this.model.cells[i][j];
                // 変更のないセルは無視する
                if(this.beforeRender && color == this.beforeRender[i][j]) {
                    continue;
                }
                // 一度消す
                this.ctx.fillStyle = BASE_COLOR;
                this.ctx.fillRect(j * CELL_SIZE + GAP, i * CELL_SIZE + GAP, CELL_SIZE - GAP * 2, CELL_SIZE - GAP * 2);

                if(color == 1) {
                    this.ctx.fillStyle = BLACK_COLOR;
                } else if (color == -1) {
                    this.ctx.fillStyle = WHITE_COLOR;
                }
                this.ctx.beginPath();
                this.ctx.arc((j + 0.5) * CELL_SIZE, (i + 0.5) * CELL_SIZE, CELL_SIZE / 2 - 4 * GAP, 0, 2 * Math.PI);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        this.beforeRender = JSON.parse(JSON.stringify(this.model.cells));
    }

}

const Controller = class {
    constructor() {
        this.canvas = this.createCanvas();
        this.canvas.addEventListener('click', e => {
            this.clickTable(e);
        })
        document.body.appendChild(this.canvas);

        this.info = document.createElement('div');
        this.info.id = 'info';
        document.body.appendChild(this.info);

        this.ai = document.createElement('div');
        this.ai.addEventListener('commandAI', e => {
            this.callAI();
        });

        this.ctx = this.canvas.getContext('2d');
        this.model = new Model();
        this.view = new View(this.ctx, this.model, this.info);
    }

    createCanvas() {
        const canvas = document.createElement('canvas')
        canvas.id = 'canvas';
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        return canvas;
    }

    clickTable(e) {
        // Canvasに対する相対座標を取得
        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        // マスの座標に変換
        const x = Math.floor(point.x / CELL_SIZE);
        const y = Math.floor(point.y / CELL_SIZE);

        this.setDisk(x, y);
    }

    setDisk(x, y) {
        // 盤面の情報を変更
        const changeDisks = this.getChangeDisks(x, y);
        if(changeDisks.length > 0) {
            changeDisks.push({x, y});
            changeDisks.forEach(p => {
                this.model.changeDisk(p.x, p.y, this.model.turn)
            });
            // 手番を変更
            this.nextTurn();
        } else {
            this.model.message = 'ここには置けません。';
        }
        this.view.render();
    }

    nextTurn() {
        this.model.nextTurn();

        // 白番でAIを呼ぶ
        if(this.model.turn == -1) {
            this.ai.dispatchEvent(new CustomEvent('commandAI'));
        }
    }

    /**
     * そのマスに置くことで裏返される石の座標を返す
     * 置けない場合は空配列を返す
     * @param {int} x
     * @param {int} y
     */
    getChangeDisks(x, y) {
        if(this.model.cells[y][x] !== 0) {
            return [];
        }
        // 8方向に対して走査
        let changeDisks = [];
        [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(dxdy => {
            let dx, dy, px, py;
            [dx, dy] = dxdy;
            [px, py] = [x + dx, y + dy];
            let tmp = [];
            while(px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
                const nextDisk = this.model.cells[py][px];
                if(nextDisk == 0) {
                    break;
                } else if(nextDisk !== this.model.turn) {
                    tmp.push({x: px, y: py});
                } else {
                    changeDisks.push(...tmp);
                }
                px += dx;
                py += dy;
            }
        });
        return changeDisks;
    }

    callAI() {
        // 左上からおけるところに置く
        for(let i = 0; i < HEIGHT; i++) {
            for(let j = 0; j < WIDTH; j++) {
                if(this.getChangeDisks(j, i).length > 0) {
                    this.setDisk(j, i);
                    return;
                }
            }
        }
    }
}