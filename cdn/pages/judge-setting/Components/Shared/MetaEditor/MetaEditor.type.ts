export interface IJudgeInfoWithMeta {
    timeLimit?: number;
    memoryLimit?: number;
    fileIo?: {
        inputFilename: string;
        outputFilename: string;
    };
}

export interface IMetaEditorOptions {
    // Some of the problem types doesn't have ALL meta props
    enableTimeMemoryLimit: boolean;
    enableFileIo: boolean;
}
