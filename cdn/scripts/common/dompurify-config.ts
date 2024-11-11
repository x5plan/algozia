interface Window {
    GlobalDOMPurifyConfig: typeof DOMPurifyConfig;
}

const DOMPurifyConfig = {
    ALLOWED_TAGS: [
        "a",
        "b",
        "i",
        "u",
        "em",
        "strong",
        "small",
        "mark",
        "abbr",
        "code",
        "pre",
        "blockquote",
        "ol",
        "ul",
        "li",
        "br",
        "p",
        "hr",
        "div",
        "span",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "caption",
        "img",
    ],
    ALLOWED_ATTR: ["href", "title", "alt", "src", "width", "height", "target", "md-data-id"],
};

window.GlobalDOMPurifyConfig = DOMPurifyConfig;
