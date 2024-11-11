import { Injectable } from "@nestjs/common";

import { E_ProblemType } from "@/problem/problem.type";
import { ISubmissionTestcaseResult } from "@/submission/submission.type";

import { IProblemJudgeInfo, IProblemTypeServiceInterface } from "./problem-type.type";
import { ProblemTypeInteractionService } from "./problem-type-interaction.service";
import { ProblemTypeSubmitAnswerService } from "./problem-type-submit-answer.service";
import { ProblemTypeTraditionalService } from "./problem-type-traditional.service";

@Injectable()
export class ProblemTypeService {
    private readonly typeServiceMap: Record<
        E_ProblemType,
        IProblemTypeServiceInterface<IProblemJudgeInfo, ISubmissionTestcaseResult>
    >;

    constructor(
        private readonly problemTypeTraditionalService: ProblemTypeTraditionalService,
        private readonly problemTypeSubmitAnswerService: ProblemTypeSubmitAnswerService,
        private readonly problemTypeInteractionService: ProblemTypeInteractionService,
    ) {
        this.typeServiceMap = {
            [E_ProblemType.Traditional]: this.problemTypeTraditionalService,
            [E_ProblemType.SubmitAnswer]: this.problemTypeSubmitAnswerService,
            [E_ProblemType.Interaction]: this.problemTypeInteractionService,
        };
    }

    public get(problemType: E_ProblemType) {
        return this.typeServiceMap[problemType];
    }
}
