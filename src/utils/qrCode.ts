import qrcode from 'qrcode'

export const generateQrCode = (code: string) => {
    return qrcode.toDataURL(code)
}