import { CE_Prompt } from "./common/prompt";

$(() => {
    $("#login-form").form({
        on: "submit",
        keyboardShortcuts: false,
        fields: {
            username: {
                identifier: "username",
                rules: [
                    {
                        type: "empty",
                        prompt: CE_Prompt.Login_UsernameEmpty,
                    },
                ],
            },
            password: {
                identifier: "password",
                rules: [
                    {
                        type: "empty",
                        prompt: CE_Prompt.Login_PasswordEmpty,
                    },
                ],
            },
        },
    });
});
