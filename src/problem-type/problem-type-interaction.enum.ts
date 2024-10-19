import { E_SubmissionStatus } from "@/submission/submission.enum";

export enum E_ProblemJudgeInfoInteractionInteractorInterface {
    stdio = "stdio",
    shm = "shm",
}

export enum E_SubmissionTestcaseStatusInteraction {
    SystemError = E_SubmissionStatus.SystemError,

    RuntimeError = E_SubmissionStatus.RuntimeError,
    TimeLimitExceeded = E_SubmissionStatus.TimeLimitExceeded,
    MemoryLimitExceeded = E_SubmissionStatus.MemoryLimitExceeded,
    OutputLimitExceeded = E_SubmissionStatus.OutputLimitExceeded,

    PartiallyCorrect = E_SubmissionStatus.PartiallyCorrect,
    WrongAnswer = E_SubmissionStatus.WrongAnswer,
    Accepted = E_SubmissionStatus.Accepted,

    JudgementFailed = E_SubmissionStatus.JudgementFailed,
}
