import type { TransformerFactory } from "../types/transformer";

export interface IArrayTransformerOptions {
    /**
     * A substring that the string can split to an array by
     * @default ","
     */
    splitBy?: string;
    /**
     * A function to convert each item
     * @param value Each strings in the array
     * @default(value: string) => value.trim()
     * @return Converted value
     */
    transformItem?: (value: string) => unknown;
}

export const createArrayTransformer: TransformerFactory<IArrayTransformerOptions> = (options = {}) => {
    const { splitBy = ",", transformItem = (value: string) => value.trim() } = options;

    return ({ value }) => {
        if (typeof value === "string") {
            return value.split(splitBy).map(transformItem);
        }
        return value;
    };
};
