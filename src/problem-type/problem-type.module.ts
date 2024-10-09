import { Module } from "@nestjs/common";

import { ProblemTypeTraditionalService } from "./problem-type-traditional.service";

@Module({
    exports: [ProblemTypeTraditionalService],
})
export class ProblemTypeModule {}
