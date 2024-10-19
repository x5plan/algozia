export enum E_SubmissionProgressType {
    Preparing = "Preparing",
    Compiling = "Compiling",
    Running = "Running",
    Finished = "Finished",
}

export enum E_SubmissionStatus {
    Pending = "Pending",

    ConfigurationError = "ConfigurationError",
    SystemError = "SystemError",
    Canceled = "Canceled",

    CompilationError = "CompilationError",

    FileError = "FileError",
    RuntimeError = "RuntimeError",
    TimeLimitExceeded = "TimeLimitExceeded",
    MemoryLimitExceeded = "MemoryLimitExceeded",
    OutputLimitExceeded = "OutputLimitExceeded",

    PartiallyCorrect = "PartiallyCorrect",
    WrongAnswer = "WrongAnswer",
    Accepted = "Accepted",

    JudgementFailed = "JudgementFailed",
}
