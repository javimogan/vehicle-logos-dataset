import path from 'path';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import { IBrand } from './types';
import slug from 'slug';

async function getFiles(directoryPath: string) {
    try {
        return await fs.promises.readdir(directoryPath)
    } catch (error) {
        console.log(error)
        return []
    }
}

async function createRoundImage(fileName: string, fileDir: string, outputDir: string): Promise<boolean> {

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
(async () => {
    const originalPath = path.join(__dirname, 'originals')
    const outputDir = path.join(__dirname, '../logos');
    const githubImageURL = 'https://raw.githubusercontent.com/javimogan/vehicle-logos-dataset/main/logos';
    const files = await getFiles(originalPath)
    const brands: IBrand[] = [];

    await Promise.all(files.map(async (f) => {
        await createRoundImage(f, originalPath, path.join(outputDir, 'rounds'));
        let title = f.split('.')[0].toLowerCase().replace(/[-_]/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        brands.push({
            name: title,
            slug: slug(title),
            image: {
                round: `${githubImageURL}/rounds/${f}`,
                original: `${githubImageURL}/originals/${f}`
            }
        });
    }));

    // Write content to file
    fs.writeFileSync(path.join(outputDir, 'logos.json'), JSON.stringify(brands, null, 2));

})()