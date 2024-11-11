interface Window {
    FileUploadUtil: typeof FileUploadUtil;
}

interface ISignedUploadRequest {
    uuid: string;
    method: "POST" | "PUT";
    url: string;
    extraFormData?: any;
    fileFieldName?: string;
    token: string;
}

interface ISignedUploadRequestResponse {
    error?: string;
    uploadRequest?: ISignedUploadRequest;
}

namespace FileUploadUtil {
    export function openUploadDialog(callback?: (files: File[]) => void, accept: string = "*") {
        const input = document.createElement("input");
        input.accept = accept;
        input.type = "file";
        input.multiple = true;
        input.style.display = "none";
        input.onchange = () => callback?.(Array.from(input.files || []));
        input.click();
    }

    export async function uploadProblemFileAsync(file: File, type: "testdata" | "additional", problemId: number) {
        const data: ISignedUploadRequestResponse = await $.post({
            url: `/problem/${problemId}/signFileUploadRequest`,
            data: JSON.stringify({ size: file.size }),
            dataType: "json",
            processData: false,
            contentType: "application/json",
        });

        if (data.error) {
            return data.error;
        }

        const uploadRequest = data.uploadRequest!;

        if (uploadRequest.method === "PUT") {
            await $.ajax({
                url: uploadRequest.url,
                method: "PUT",
                data: file,
                processData: false,
                contentType: file.type,
            });
        } else if (uploadRequest.method === "POST") {
            const formData = new FormData();
            Object.entries(uploadRequest.extraFormData).forEach(([key, value]) =>
                formData.append(key, value as string),
            );
            formData.append(uploadRequest.fileFieldName!, file);

            await $.post({
                url: uploadRequest.url,
                data: formData,
                processData: false,
                contentType: false,
            });
        } else {
            return `Invalid upload method ${uploadRequest.method}`;
        }

        const resp = await $.post({
            url: `/problem/${problemId}/reportFileUploadFinished`,
            data: JSON.stringify({
                filename: file.name,
                type,
                token: uploadRequest.token,
            }),
            processData: false,
            dataType: "json",
            contentType: "application/json",
        });

        if (resp.error) {
            return resp.error;
        }

        return null;
    }
}

window.FileUploadUtil = FileUploadUtil;
