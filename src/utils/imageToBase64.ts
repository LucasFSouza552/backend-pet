import fs from 'fs';
import path from 'path';

export function getLogoBase64(): string {
    try {
        const logoPath = path.join(__dirname, '../../public/assets/logoPet.png');
        const imageBuffer = fs.readFileSync(logoPath);
        const base64Image = imageBuffer.toString('base64');
        return `data:image/png;base64,${base64Image}`;
    } catch (error) {
        console.error('Erro ao carregar logo:', error);
        return '';
    }
}

