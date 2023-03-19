import { createCanvas, loadImage } from 'canvas';
import path from 'path'
import fs from 'fs';
export async function createRoundImage(fileName: string, fileDir: string, outputDir: string): Promise<boolean> {

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const circle = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: canvas.width / 2,
    }

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);
    ctx.closePath();

    ctx.fillStyle = fileName.split('_')[0] === 'default' ? '#A8DFBE' : '#ffffff';
    ctx.fill();


    const image = await loadImage(path.join(fileDir, fileName))


    const isHorizontal = image.width > image.height;
    const ratio = isHorizontal
        ? image.width / image.height
        : image.height / image.width;
    const width = canvas.width * 0.65; // set the width you want
    const height = isHorizontal ? width / ratio : width * ratio;

    ctx.drawImage(image, circle.x - (width / 2), circle.y - (height / 2), width, height);
    return new Promise((resolve, reject) => {
        canvas.createPNGStream().pipe(fs.createWriteStream(path.join(outputDir, fileName))).once('finish', () => {
            resolve(true)
        })
    })

}