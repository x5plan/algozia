import type { TransformerFactory } from "../types/transformer";

export interface IBooleanTransformerOptions {
    /**
     * Values that need to be converted to true
     * @default[true, "enabled", "true", "on", 1, "1"]
     */
    trueValues?: unknown[];
    /**
     * Values that need to be converted to false
     * @default[false, "disabled", "false", "off", 0, "0"]
     */
    falseValues?: unknown[];
}

export const createBooleanTransformer: TransformerFactory<IBooleanTransformerOptions> = (options = {}) => {
    const {
        trueValues = [true, "enabled", "true", "on", 1, "1"],
        falseValues = [false, "disabled", "false", "off", 0, "0"],
    } = options;

    return ({ value }) => {
        if (trueValues.includes(value)) {
            return true;
        }

        if (falseValues.includes(value)) {
            return false;
        }

        return value;
    };
};
