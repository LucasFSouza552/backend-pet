import { ThrowError } from "../errors/ThrowError";
import { cryptPassword } from "./aes-crypto";

export default class BuilderDTO<T> {
    private _rawData: Record<string, T>;
    private _data: Record<string, T>;

    constructor(data: Record<string, T> = {}) {
        this._rawData = data;
        this._data = {};
    }

    private getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    }

    add({ key, type = "string", required = true }: { key: string, type?: "string" | "number" | "boolean", required?: boolean }): BuilderDTO<T> {
        let value: any = this.getValueByPath(this._rawData, key);
        if (value === undefined) {
            if (required) {
                console.error("Por favor, preencha todos os campos obrigatórios: ", key);
                throw ThrowError.badRequest("Por favor, preencha todos os campos obrigatórios");
            } else {
                return this;
            }
        }

        switch (type) {
            case "string":
                value = String(value);
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

    build(): T {
        return this._data as unknown as T;
    }
}