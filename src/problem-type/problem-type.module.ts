import { Module } from "@nestjs/common";

import { ProblemTypeService } from "./problem-type.service";
import { ProblemTypeSubmitAnswerService } from "./problem-type-submit-answer.service";
import { ProblemTypeTraditionalService } from "./problem-type-traditional.service";

@Module({
    providers: [ProblemTypeService, ProblemTypeTraditionalService, ProblemTypeSubmitAnswerService],
    exports: [ProblemTypeService],
})
export class ProblemTypeModule {}
