export function restrictProperties<T extends object>(object: T, whiteListedProperties: (keyof T)[]): void {
    if (!object) return;

    Object.keys(object).forEach((key) => {
        if (!whiteListedProperties.includes(key as keyof T)) {
            delete object[key as keyof T];
        }
    });
}
