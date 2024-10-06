export type ToEntity<T extends object> = {
    [K in keyof T]: undefined extends T[K] ? Exclude<T[K], undefined> | null : T[K];
};
