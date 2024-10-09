import { forwardRef, Module } from "@nestjs/common";

import { CodeLanguageModule } from "@/code-language/code-language.module";

import { ProblemTypeService } from "./problem-type.service";
import { ProblemTypeInteractionService } from "./problem-type-interaction.service";
import { ProblemTypeSubmitAnswerService } from "./problem-type-submit-answer.service";
import { ProblemTypeTraditionalService } from "./problem-type-traditional.service";

@Module({
    imports: [forwardRef(() => CodeLanguageModule)],
    providers: [
        ProblemTypeService,
        ProblemTypeTraditionalService,
        ProblemTypeSubmitAnswerService,
        ProblemTypeInteractionService,
    ],
    exports: [ProblemTypeService],
})
export class ProblemTypeModule {}
