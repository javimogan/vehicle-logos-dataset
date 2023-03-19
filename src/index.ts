import path from 'path';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import { IBrand } from './types';
import slug from 'slug';
import { createRoundImage } from './utils/roundImage';
import { createThumbnail } from './utils/thumbnail';

const GITHUB_IMAGE_BASE_URL = 'https://raw.githubusercontent.com/javimogan/vehicle-logos-dataset/main/logos';
const ORIGINAL_PATH = path.join(__dirname, 'originals')
const OUTPUT_DIR = path.join(__dirname, '../logos');


async function getFiles(directoryPath: string) {
    try {
        return await fs.promises.readdir(directoryPath)
    } catch (error) {
        console.log(error)
        return []
    }
}

function createDirsIfNotExists(dirs: string[]) {
    // Create dir if dont exist
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
}

async function createImages(): Promise<IBrand[]>{
    const brands: IBrand[] = [];
    await Promise.all((await getFiles(ORIGINAL_PATH)).map(async (f) => {
        await createRoundImage(f, ORIGINAL_PATH, path.join(OUTPUT_DIR, 'rounds'));
        let title = f.split('.')[0].toLowerCase().replace(/[-_]/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
        brands.push({
            name: title,
            slug: slug(title),
            image: {
                round: `${GITHUB_IMAGE_BASE_URL}/rounds/${f}`,
                original: `${GITHUB_IMAGE_BASE_URL}/originals/${f}`,
                local_round: path.join('.', 'rounds', f)

            }
        });
    }));
    return brands;
}

(async () => {
    createDirsIfNotExists([OUTPUT_DIR, path.join(OUTPUT_DIR, 'rounds')])

    const brands = await createImages();

    await createThumbnail(path.join(OUTPUT_DIR, 'thumbnail.png'), brands, OUTPUT_DIR);
    // Write content to file
    fs.writeFileSync(path.join(OUTPUT_DIR, 'logos.json'), JSON.stringify(brands, null, 2));

})()