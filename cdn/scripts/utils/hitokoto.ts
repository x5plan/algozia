interface IHitokotoResponse {
    readonly id: number;
    readonly uuid: string;
    readonly hitokoto: string;
    readonly type: string;
    readonly from: string;
    readonly from_who: string | null;
    readonly creator: string;
    readonly creator_uid: number;
    readonly reviewer: number;
    readonly commit_from: string;
    readonly created_at: string;
    readonly length: number;
}

interface Window {
    createHitokoto: (target: string, types?: string[]) => void;
}

function getHitokotoUrl(types?: string[]) {
    let url = "https://v1.hitokoto.cn";

    if (types && types.length > 0) {
        url += "?" + types.map((t) => `c=${t}`).join("&");
    }

    return url;
}

window.createHitokoto = function (target, types) {
    $(function () {
        const $target = $(target);
        if (!$target) return;

        const $loader = $("<div>");
        $loader.addClass("ui active centered inline loader");
        $target.append($loader);

        $.get(getHitokotoUrl(types), function (data: IHitokotoResponse) {
            if (typeof data === "string") {
                data = JSON.parse(data) as IHitokotoResponse;
            }
            $loader.removeClass("active");

            const $content = $("<div>");
            $content.addClass("content");
            $content.text(data.hitokoto);
            $target.append($content);

            if (data.from) {
                const $from = $("<div>");
                $from.addClass("from");
                $from.text(data.from);
                $target.append($from);
            }
        });
    });
};
