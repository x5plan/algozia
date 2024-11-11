declare namespace FomanticUI {
    interface FormSettings {
        fields: Record<string, FormSettingsFieldItem>;
        rules: Record<`custom_${string}`, (value: any, params?: any) => boolean>;
    }

    interface FormSettingsFieldItem {
        identifier?: string;
        depends?: string;
        rules: FormSettingsFieldsRule[];
    }

    interface FormSettingsFieldsRule {
        type: FormSettingsFieldsRuleType;
        value?: any;
        prompt: string | ((value: string) => string);
    }

    type FormSettingsFieldsRuleType =
        // Empty
        | "empty"
        | "checked"
        // Content Type
        | "email"
        | "url"
        | "integer"
        | `integer[${number}..${number}]`
        | "decimal"
        | `decimal[${number}..${number}]`
        | "number"
        | `number[${number}..${number}]`
        | "minValue"
        | `minValue[${number}]`
        | "maxValue"
        | `maxValue[${number}]`
        | "regExp"
        | `regExp[/${string}/${string}]`
        // Payment
        | "creditCard"
        | `creditCard[${"visa" | "mastercard" | "unionpay"}]`
        // Specified Content
        | "contains"
        | `contains[${string}]`
        | "containsExactly"
        | `containsExactly[${string}]`
        | "doesntContain"
        | `doesntContain[${string}]`
        | "doesntContainExactly"
        | `doesntContainExactly[${string}]`
        | "is"
        | `is[${string}]`
        | "isExactly"
        | `isExactly[${string}]`
        | "not"
        | `not[${string}]`
        | "notExactly"
        | `notExactly[${string}]`
        // Length
        | "minLength"
        | `minLength[${number}]`
        | "exactLength"
        | `exactLength[${number}]`
        | "maxLength"
        | `maxLength[${number}]`
        | "size"
        | `size[${number}..${number}]`
        // Matching Fields
        | "match"
        | `match[${string}]`
        | "different"
        | `different[${string}]`
        // Selection Count
        | "minCount"
        | `minCount[${number}]`
        | "exactCount"
        | `exactCount[${number}]`
        | "maxCount"
        | `maxCount[${number}]`
        // Custom
        | `custom_${string}`;
}
