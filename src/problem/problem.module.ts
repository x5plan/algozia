import { Module } from "@nestjs/common";

import { ProblemController } from "./problem.controller";

@Module({
    controllers: [ProblemController],
})
export class ProblemModule {}
