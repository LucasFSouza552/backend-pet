export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    details?: any;
}

export const successResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

export const errorResponse = (
    message: string,
    details: any = null
): ApiResponse => ({
    success: false,
    message: message,
    ...(details && { details }),
});