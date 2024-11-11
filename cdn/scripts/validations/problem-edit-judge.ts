import { CE_Prompt } from "./common/prompt";

type ITextItem = "timeLimit" | "memoryLimit" | "inputFileName" | "outputFileName";
type ICheckedItem = "type" | "fileIO";

$(() => {
    const getCheckedValue = (name: ICheckedItem) => $(`#judge-info-form input[name="${name}"]:checked`).val();
    const setCheckedValue = (name: ICheckedItem, value: string) => {
        $(`#judge-info-form input[name="${name}"]:checked`).prop("checked", false);
        $(`#judge-info-form input[name="${name}"][value="${value}"]`).prop("checked", true);
    };
    const setTextValue = (name: ITextItem, value: string) => $(`#judge-info-form input[name="${name}"]`).val(value);

    $.fn.form.settings.rules.custom_timeLimit = (value) => {
        if (getCheckedValue("type") === "submit-answer") {
            return true;
        }

        return !!value && Number.isInteger(Number(value)) && Number.parseInt(value, 10) >= 1;
    };

    $.fn.form.settings.rules.custom_memoryLimit = (value) => {
        if (getCheckedValue("type") === "submit-answer") {
            return true;
        }

        return !!value && Number.isInteger(Number(value)) && Number.parseInt(value, 10) >= 1;
    };

    $.fn.form.settings.rules.custom_fileName = (value) => {
        if (getCheckedValue("type") !== "traditional") {
            return true;
        }

        if (getCheckedValue("fileIO") === "false") {
            return true;
        }

        return !!value;
    };

    $("#judge-info-form")
        .form({
            on: "submit",
            keyboardShortcuts: false,
            fields: {
                timeLimit: {
                    identifier: "time-limit",
                    rules: [
                        {
                            type: "custom_timeLimit",
                            prompt: CE_Prompt.Problem_TimeLimit,
                        },
                    ],
                },
                memoryLimit: {
                    identifier: "memory-limit",
                    rules: [
                        {
                            type: "custom_memoryLimit",
                            prompt: CE_Prompt.Problem_MemoryLimit,
                        },
                    ],
                },
                inputFileName: {
                    identifier: "input-file",
                    rules: [
                        {
                            type: "custom_fileName",
                            prompt: CE_Prompt.Problem_InputFileName,
                        },
                    ],
                },
                outputFileName: {
                    identifier: "output-file",
                    rules: [
                        {
                            type: "custom_fileName",
                            prompt: CE_Prompt.Problem_OutputFileName,
                        },
                    ],
                },
            },
        })
        .on("submit", () => {
            if (getCheckedValue("type") === "submit-answer") {
                setTextValue("timeLimit", "");
                setTextValue("memoryLimit", "");
            }

            if (getCheckedValue("type") !== "traditional") {
                setCheckedValue("fileIO", "false");
            }

            if (getCheckedValue("fileIO") === "false") {
                setTextValue("inputFileName", "");
                setTextValue("outputFileName", "");
            }

            return true;
        });
});
