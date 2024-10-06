import type { CE_Order } from "./order";

export interface ISortableQuery {
    sortBy?: string;
    order?: CE_Order;
}

export type ISortableResponse = Required<ISortableQuery>;
