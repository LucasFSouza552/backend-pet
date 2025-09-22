export class ThrowError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, new.target.prototype);
    }

    static badRequest(message: string) {
        return new ThrowError(400, message);
    }

    static unauthorized(message: string) {
        return new ThrowError(401, message);
    }

    static notFound(message: string) {
        return new ThrowError(404, message);
    }

    static internal(message: string) {
        return new ThrowError(500, message);
    }

    static conflict(message: string) {
        return new ThrowError(409, message);
    }

    static forbidden(message: string) {
        return new ThrowError(403, message);
    }
}