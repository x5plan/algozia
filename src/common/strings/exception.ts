// Use chinses string values in the enum

export const enum CE_ExceptionString {
    // Common
    ValidationError = "数据验证错误",
    NoSuchUser = "用户不存在",
    NoSuchProblem = "题目不存在",
    Developing = "功能开发中",
    PermissionDenied = "权限不足",
    LoginRequired = "请先登录",
    MinIOError = "MinIO 错误",

    // Auth
    Auth_WrongPassword = "密码错误",
    // User

    // Problem
    Problem_DisplayIdAlreadyExists = "题目编号已存在",
    Problem_InvalidProblemJudgeInfo = "无效的评测信息",
    Problem_InvalidProblemType = "已有提交的题目不允许在提交答案和非提交答案之间更改",
    Problem_NoSuchProblemFile = "题目文件不存在",
    Problem_FileSizeTooLarge = "文件大小超过限制",
    Problem_TestDataRequired = "请先添加测试数据",
    Problem_NoProblemJudgeInfo = "题目没有评测信息",
    Problem_InvalidLanguageOrCompileOptions = "无效的语言或编译选项",
    Problem_EmptyCode = "代码为空",
    Problem_NotAllowedToSubmitFile = "不允许提交文件",

    // File
    File_NoSuchFile = "未找到文件",
    File_UUIDExists = "文件 UUID 已存在",
    File_InvalidSignedData = "无效的签名数据",
}

export const enum CE_JudgeInfoValidationMessage {
    InvalidCheckerType = "非法的检查器类型",
    InvalidCheckerOptions = "非法的检查器选项",
    InvalidCheckerLanguage = "非法的检查器语言",
    InvalidCheckerInterface = "非法的检查器接口",
    NoSuchCheckerFile = "找不到检查器文件: {0}",
    InvalidCheckerCompileAndRunOptions = "非法的检查器编译运行选项",
    InvalidCheckerTimeLimit = "非法的检查器时间限制",
    InvalidCheckerMemoryLimit = "非法的检查器内存限制",
    InvalidTimeLimitOnTaskOrCase = "非法的任务或测试点时间限制",
    InvalidMemoryLimitOnTaskOrCase = "非法的任务或测试点内存限制",
    InvalidFileIOFilename = "非法的文件IO文件名: {0}",
    NoTestcases = "子任务 {0} 没有测试点",
    InvalidScoringType = "非法的评分类型: {0}",
    InvalidPointsSubtask = "子任务 {0} 非法的分数: {1}",
    InvalidPointsTestcase = "子任务 {0} 测试点 {1} 非法的分数: {2}",
    InvalidDependency = "非法的依赖关系",
    SubtaskHasNoTestcases = "子任务没有测试点",
    NoSuchInputFile = "找不到输入文件: {0}",
    NoSuchOutputFile = "找不到输出文件: {0}",
    InvalidUserOutputFilename = "非法的用户输出文件名: {0}",
    DuplicateUserOutputFilename = "重复的用户输出文件名: {0}",
    PointsSumUpToLargerThan100Testcases = "子任务 {0} 测试点分数之和大于100",
    PointsSumUpToLargerThan100Subtasks = "子任务分数之和大于100",
    CyclicalSubtaskDependency = "子任务存在循环依赖",
    TooManyTestcases = "测试点过多",
    InvalidExtraSourceFiles = "非法的额外源文件",
    InvalidExtraSourceFilesLanguage = "非法的额外源文件语言",
    InvalidExtraSourceFilesDst = "非法的额外源文件目标: {0} ({1})",
    NoSuchExtraSourceFilesSrc = "找不到额外源文件: {0} ({1})",
    InvalidInteractor = "非法的交互器",
    InvalidInteractorInterface = "非法的交互器接口",
    InvalidInteractorSharedMemorySize = "非法的交互器共享内存大小",
    InvalidInteractorLanguage = "非法的交互器语言",
    InvalidInteractorCompileAndRunOptions = "非法的交互器编译运行选项",
    NoSuchInteractorFile = "找不到交互器文件: {0}",
    InvalidInteractorTimeLimit = "非法的交互器时间限制",
    InvalidInteractorMemoryLimit = "非法的交互器内存限制",
    Unknown = "未知错误",
}
