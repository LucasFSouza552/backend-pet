import { FilterQuery } from "mongoose";
import { isValidJSON } from "./Json";

export function builderFilterQuery<T>(rawQuery: any, allowedFields: string[]): FilterQuery<T> {
    let queryObj: any;

    if (typeof rawQuery === "string" && isValidJSON(rawQuery)) {
        queryObj = JSON.parse(rawQuery);
    } else if (typeof rawQuery === "object" && rawQuery !== null) {
        queryObj = rawQuery;
    } else {
        return {} as FilterQuery<T>;
    }

    return Object.keys(queryObj)
        .filter(key => allowedFields.includes(key))
        .reduce((acc, key) => {
            acc[key as keyof T] = queryObj[key];
            return acc;
        }, {} as FilterQuery<T>);
}