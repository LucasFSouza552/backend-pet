function isValidJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

export { isValidJSON };