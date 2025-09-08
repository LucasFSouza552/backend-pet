import { cryptPassword } from "./aes-crypto";

export default class BuilderDTO<T> {
    private _rawData: Record<string, T>;
    private _data: Record<string, T>;

    constructor(data: Record<string, T> = {}) {
        this._rawData = data;
        this._data = {};
    }

    add(key: string, type: "string" | "number" | "boolean" | "password" = "string"): BuilderDTO<T> {
        if (this._rawData[key] === undefined) {
            return this;
        }
        let value: any = this._rawData[key];

        switch (type) {
            case "string":
                value = String(value);
                break;
            case "password":
                value = cryptPassword(value);
                break;
            case "number":
                value = Number(value);
                if (isNaN(value)) throw new Error(`Campo ${key} não é um número válido`);
                break;
            case "boolean":
                value = Boolean(value);
                break;
        }

        this._data[key] = value;


        return this;
    }

    build(): Record<string, T> {
        return this._data;
    }
}