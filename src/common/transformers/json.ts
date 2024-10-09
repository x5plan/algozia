import type { TransformerFactory } from "../types/transformer";

export const createJsonTransformer: TransformerFactory = () => {
    return ({ value }) => {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    };
};
