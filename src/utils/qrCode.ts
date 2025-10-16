import { QrCodePix } from 'qrcode-pix';
import { ThrowError } from '@errors/ThrowError';

export default async function qrCode(key: string, name: string, city: string) {
    const transactionId = Math.random().toString(36).substring(2, 12).toUpperCase();

    try {
        const dadosPix = {
            version: '01',
            key,
            name,
            city,
            transactionId: transactionId
        };

        const qrCodePix = QrCodePix(dadosPix);

        return {
            payload: qrCodePix.payload(),
            base64: await qrCodePix.base64()
        }
    } catch (error) {
        throw ThrowError.internal("Não foi possível gerar o QR code")
    }
}

