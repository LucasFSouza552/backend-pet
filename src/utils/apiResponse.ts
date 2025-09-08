export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
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
    error: message,
    ...(details && { details }),
});