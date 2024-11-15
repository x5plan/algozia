const utils = ["hitokoto", "markdown", "highlight", "file-upload", "page-app-loader"];
const validations = ["auth-login", "auth-register", "problem-edit-judge"];

/**
 * @type {{
 * src: string,
 * dist: string,
 * }[]}
 */
export default [
    {
        src: "common/index",
        dist: "index",
    },
    ...utils.map((util) => ({
        src: `utils/${util}`,
        dist: `${util}`,
    })),
    ...validations.map((validation) => ({
        src: `validations/${validation}`,
        dist: `validations/${validation}`,
    })),
];
