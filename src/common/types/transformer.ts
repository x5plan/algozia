import type { TransformFnParams } from "class-transformer";

export type TransformerFactory<T> = (options?: T) => (props: TransformFnParams) => unknown;
