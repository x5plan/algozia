import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

import { CE_Order } from "@/common/types/order";
import { IPageable } from "@/common/types/pageable";
import { ISortable } from "@/common/types/sortable";

import { ProblemEntity } from "../problem.entity";
import { E_ProblemSortBy } from "../problem.type";

export class ProblemListGetRequestQueryDto implements ISortable {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    public readonly page: number;

    @IsIn([CE_Order.Asc, CE_Order.Desc])
    @IsOptional()
    public readonly order: CE_Order;

    @IsEnum(E_ProblemSortBy)
    @IsOptional()
    public readonly sortBy: E_ProblemSortBy;

    @IsString()
    @IsOptional()
    public readonly keyword: string;
}

export class ProblemListItemDto extends ProblemEntity {}

export class ProblemListGetResponseDto implements ISortable, IPageable {
    public problems: ProblemListItemDto[];

    public sortBy: string;
    public order: CE_Order;

    public pageCount: number;
    public currentPage: number;
}
