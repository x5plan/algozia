import { Module } from "@nestjs/common";

import { ContestController } from "./contest.controller";

@Module({
    controllers: [ContestController],
})
export class ContestModule {}
