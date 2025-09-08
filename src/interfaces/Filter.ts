export default interface Filter {
    page: number;
    limit: number;
    orderBy: string;
    order: 'asc' | 'desc';
    query?: Record<string, any>;
}

export const FilterDefault: Filter = {
    page: 1,
    limit: 10,
    orderBy: 'createdAt',
    order: 'desc',
    query: {}
};