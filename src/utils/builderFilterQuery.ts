import { FilterQuery } from "mongoose";
import { isValidJSON } from "./Json";

export function builderFilterQuery<T>(rawQuery: any, allowedFields: string[]): FilterQuery<T> {

    let query: FilterQuery<T> = {};
    if (typeof rawQuery === "string" && isValidJSON(rawQuery)) {
        query = JSON.parse(rawQuery);

        return Object.keys(query)
            .filter((key) => allowedFields.includes(key))
            .reduce((acc, key) => {
                acc[key as keyof T] = query[key];
                return acc;
            }, {} as FilterQuery<T>);
    }
    return {} as FilterQuery<T>;
}