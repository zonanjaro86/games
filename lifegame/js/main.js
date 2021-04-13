CELL_WIDTH = 10;
CELL_HEIGHT = 10;
COL_NUM = 10;
ROW_NUM = 10;

window.addEventListener('load', () => {
    // canvas
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', CELL_WIDTH * COL_NUM + 'px');
    canvas.setAttribute('height', CELL_HEIGHT * ROW_NUM + 'px');
    canvas.classList.add('main_canvas')
    document.getElementById('lifegame').appendChild(canvas);

    const ctx = canvas.getContext('2d')

    // セルの状態を管理する2d配列
    const cells = [...Array(ROW_NUM)].map(() => Array(COL_NUM).fill(false));

    // 描画テスト
    cells[4][5] = true;

    for(let i=0;i<ROW_NUM;i++) {
        for (let j=0;j<COL_NUM;j++) {
            if (cells[i][j]) {
                ctx.fillRect(CELL_WIDTH * j, CELL_HEIGHT * i, CELL_WIDTH, CELL_HEIGHT)
            }
        }
    }

})
