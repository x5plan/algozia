import { Module } from "@nestjs/common";

import { SubmissionController } from "./submission.controller";

@Module({
    controllers: [SubmissionController],
})
export class SubmissionModule {}
