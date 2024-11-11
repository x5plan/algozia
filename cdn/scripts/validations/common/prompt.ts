export const enum CE_Prompt {
    // Common
    Common_Email = "邮箱格式不正确",
    Common_Username = "用户名需要仅包含大小写字母、数字和「-_.#$」，且长度在 3 到 24 之间",
    Common_Password = "密码需要在 6 到 32 之间",

    // Login
    Login_UsernameEmpty = "请输入用户名",
    Login_PasswordEmpty = "请输入密码",

    // Register
    Register_PasswordConfirm = "两次输入的密码不一致",

    // Problem
    Problem_TimeLimit = "请输入合法时间限制",
    Problem_MemoryLimit = "请输入合法内存限制",
    Problem_InputFileName = "请输入合法输入文件名",
    Problem_OutputFileName = "请输入合法输出文件名",
}
