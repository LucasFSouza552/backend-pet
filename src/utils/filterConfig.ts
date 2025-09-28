import { ThrowError } from "../errors/ThrowError";
import Filter, { FilterDefault } from "../interfaces/Filter";
import { builderFilterQuery } from "./builderFilterQuery";

interface FilterInput {
    page?: string;
    limit?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
    query?: any;
    [key: string]: any;
}

export default function filterConfig<T>(filter: FilterInput, allowedFields: string[]): Filter {
    const { page, limit, orderBy, order, query: rawQuery, ...rest } = filter;

    const limitNumber = limit ? parseInt(limit) : FilterDefault.limit;
    const pageNumber = page ? parseInt(page) : FilterDefault.page;

    if (limitNumber < 0 || limitNumber > 100) {
        throw new ThrowError(400, "O limite de itens deve estar entre 0 e 100");
    }

    if (pageNumber < 1) {
        throw new ThrowError(400, "A página deve ser maior que 0");
    }

    const query = builderFilterQuery<T>({...rawQuery, ...rest}, allowedFields);

    return {
        ...rest,
        limit: limitNumber,
        page: pageNumber,
        orderBy: orderBy || FilterDefault.orderBy,
        order: order || FilterDefault.order,
        query
    }
}