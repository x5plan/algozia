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
    Problem_InvalidFileIOName = "无效的文件 IO 名称",
    Problem_InvalidTimeOrMemoryLimit = "无效的时间或内存限制",
    Problem_InvalidProbelemType = "已有提交的题目不允许在提交答案和非提交答案之间更改",
    Problem_NoSuchProblemFile = "题目文件不存在",
    Problem_FileSizeTooLarge = "文件大小超过限制",

    // File
    File_NoSuchFile = "未找到文件",
    File_UUIDExists = "文件 UUID 已存在",
}
