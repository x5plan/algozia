import { CE_Prompt } from "./common/prompt";
import { c_usernameRegexp } from "./common/regexp";

$(() => {
    $("#register-form").form({
        on: "submit",
        keyboardShortcuts: false,
        fields: {
            username: {
                rules: [
                    {
                        type: "regExp",
                        value: c_usernameRegexp,
                        prompt: CE_Prompt.Common_Username,
                    },
                ],
            },
            password: {
                rules: [
                    {
                        type: "size[6..32]",
                        prompt: CE_Prompt.Common_Password,
                    },
                ],
            },
            email: {
                rules: [
                    {
                        type: "email",
                        prompt: CE_Prompt.Common_Email,
                    },
                ],
            },
            "password-confirm": {
                identifier: "password-confirm",
                rules: [
                    {
                        type: "match[password]",
                        prompt: CE_Prompt.Register_PasswordConfirm,
                    },
                ],
            },
        },
    });
});
