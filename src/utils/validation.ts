import crypto from "crypto";

const MP_SECRET = process.env.MP_SECRET as string;

export default function verifyMpSignature(xSignature: string, xRequestId: string, dataId: string) {
    if (!xSignature) return false;

    const parts = xSignature.split(",");
    let ts, hash;
    parts.forEach((p: string) => {
        const [k, v] = p.split("=").map(s => s && s.trim());
        if (k === "ts") ts = v;
        if (k === "v1") hash = v;
    });
    if (!ts || !hash) return false;

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto.createHmac("sha256", MP_SECRET).update(manifest).digest("hex");
    return expected === hash;
}