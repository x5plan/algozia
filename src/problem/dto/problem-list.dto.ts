import { Transform, Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

import { createArrayTransformer } from "@/common/transformers/array";
import { CE_Order } from "@/common/types/order";
import { IPageableQuery, IPageableResponse } from "@/common/types/pageable";
import { ISearchableQuery, ISearchableResponse } from "@/common/types/searchable";
import { ISortableQuery, ISortableResponse } from "@/common/types/sortable";

import { ProblemEntity } from "../problem.entity";
import { E_ProblemSortBy } from "../problem.type";

export class ProblemListGetRequestQueryDto implements ISortableQuery, IPageableQuery, ISearchableQuery {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    public readonly page?: number;

    @IsIn([CE_Order.Asc, CE_Order.Desc])
    @IsOptional()
    public readonly order?: CE_Order;

    @IsEnum(E_ProblemSortBy)
    @IsOptional()
    public readonly sortBy?: E_ProblemSortBy;

    @IsString()
    @IsOptional()
    public readonly keyword?: string;

    @Transform(createArrayTransformer())
    @IsInt({ each: true })
    @IsOptional()
    public readonly tags?: number[];
}

export class ProblemListItemDto extends ProblemEntity {}

export class ProblemListGetResponseDto implements ISortableResponse, IPageableResponse, ISearchableResponse {
    public problems: ProblemListItemDto[];
    public keyword: string;

    public sortBy: string;
    public order: CE_Order;

    public pageCount: number;
    public currentPage: number;

    public allowedManageProblem: boolean;
}
