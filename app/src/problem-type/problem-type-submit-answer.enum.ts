import { E_SubmissionStatus } from "@/submission/submission.enum";

export enum E_SubmissionTestcaseStatusSubmitAnswer {
    SystemError = E_SubmissionStatus.SystemError,

    FileError = E_SubmissionStatus.FileError,
    OutputLimitExceeded = E_SubmissionStatus.OutputLimitExceeded,

    PartiallyCorrect = E_SubmissionStatus.PartiallyCorrect,
    WrongAnswer = E_SubmissionStatus.WrongAnswer,
    Accepted = E_SubmissionStatus.Accepted,

    JudgementFailed = E_SubmissionStatus.JudgementFailed,
}
