// Refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

export function encodeRFC5987ValueChars(str: string): string {
    return (
        encodeURIComponent(str)
            // The following creates the sequences %27 %28 %29 %2A (Note that
            // the valid encoding of "*" is %2A, which necessitates calling
            // toUpperCase() to properly encode). Although RFC3986 reserves "!",
            // RFC5987 does not, so we do not need to escape it.
            .replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
            // The following are not required for percent-encoding per RFC5987,
            // so we can allow for a little better readability over the wire: |`^
            .replace(/%(7C|60|5E)/g, (str, hex) => String.fromCharCode(parseInt(hex, 16)))
    );
}

export function encodeRFC3986URIComponent(str: string): string {
    return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
