import { createCanvas, loadImage } from 'canvas';
import path from 'path'
import fs from 'fs';
import { IBrand } from '../types';

const GAP = 40;
const COLS = 8;
// Undefined mostrar todas las imagenes, sino limitamos el numero de filas
const ROWS: number | undefined = 4;
const CANVAS_WIDTH = 1024;
const CANVAS_BACKGROUND_COLOR = '#121212';

const HAS_TITLE: boolean = true;
const TITLE_HEIGHT = 100;
const TITLE_BACKGROUND_COLOR = '#A8DFBE';
const TITLE_TEXT_COLOR = '#121212';

export async function createThumbnail(outputFile: string, brands: IBrand[], imagesDir: string): Promise<any> {
    const numberImages = brands.length;
    let _rows = ROWS;

    if (typeof _rows === 'number') {
        // Entran todas las imagenes
        if (_rows >= Math.ceil(numberImages / COLS)) {
            _rows = Math.ceil(numberImages / COLS);
        }else{
            // No entran todas las imágenes, las podemos aleatorias
            brands = brands.sort(() => Math.random() - 0.5);
        }
    } else {
        _rows = Math.ceil(numberImages / COLS);
    }

    const IMAGE_SIZE = (CANVAS_WIDTH - (GAP * (COLS + 1))) / COLS;
    // const ROWS = Math.ceil(number_images / COLS);
    const CANVAS_HEIGHT = IMAGE_SIZE * _rows + GAP * (_rows + 1) + (HAS_TITLE ? TITLE_HEIGHT : 0);


    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (HAS_TITLE) {
        ctx.fillStyle = TITLE_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, TITLE_HEIGHT);
        ctx.fillStyle = TITLE_TEXT_COLOR;
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${brands.length} icons`, CANVAS_WIDTH / 2, TITLE_HEIGHT / 2 + 20);
    }






    // Draw logos
    let x = 0;
    let y = 0;
    for (let i = 0; i < _rows; i++) {
        y = GAP + (i * (IMAGE_SIZE + GAP)) + (HAS_TITLE ? TITLE_HEIGHT : 0);
        for (let j = 0; j < COLS; j++) {
            const imageId = i * COLS + j;
            if (imageId >= numberImages) break;
            x = GAP + (j * (IMAGE_SIZE + GAP));
            const image = await loadImage(path.join(imagesDir, brands[i * COLS + j].image.local_round))
            ctx.drawImage(image, x, y, IMAGE_SIZE, IMAGE_SIZE);
        }

    }

    // Save image

    return new Promise((resolve, reject) => {
        canvas.createPNGStream().pipe(fs.createWriteStream(outputFile)).once('finish', () => {
            resolve(true)
        })
    })

}