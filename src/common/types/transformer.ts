import type { TransformFnParams } from "class-transformer";

export type TransformerFactory<T = undefined> = (options?: T) => (props: TransformFnParams) => unknown;
