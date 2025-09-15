import { ThrowError } from "../errors/ThrowError";
import Filter, { FilterDefault } from "../interfaces/Filter";
import { IAccount } from "../models/Account";
import { builderFilterQuery } from "./builderFilterQuery";

export default function filterConfig(filter: any, allowedFields: string[]): Filter {

    const { page, limit, orderBy, order, query: rawQuery, ...rest } = filter;

    const limitNumber = parseInt(limit);
    const pageNumber = parseInt(page);

    if (limitNumber < 0 || limitNumber > 100) {
        throw new ThrowError(400, "O limite de itens deve estar entre 0 e 100");
    }

    if (pageNumber < 1) {
        throw new ThrowError(400, "A página deve ser maior que 0");
    }

    const query = builderFilterQuery<IAccount>(rawQuery, allowedFields || []);

    return {
        ...rest,
        limit: limitNumber || FilterDefault.limit,
        page: pageNumber || FilterDefault.page,
        orderBy: orderBy || FilterDefault.orderBy,
        order: order || FilterDefault.order,
        query: query || FilterDefault.query
    }
}