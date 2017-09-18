let P = require('Parsimmon');

let optWhitespace = P.optWhitespace.desc("whitespace");
let whitespace = P.whitespace.desc("separator");
let word = (str) => P.string(str);

/**
 * A token that might be wrapped with whitespaces.
 * @param parser
 */
let optWhitespaced = (parser) => optWhitespace.then(parser).skip(optWhitespace);
let mapExpr = (results) => {
    return {
        "var": results[0],
        "operation": results[1],
        "value": results[2]
    }
};


let QueryLang = P.createLanguage({
    /**
     * Matches a whole expression
     */
    fullExpr: (r) => P.alt(r.complexExpr, r.valueExpr)
        .sepBy(whitespace)
        .desc("full expression"),

    /**
     * Matches a key-value expr, e.g. key="value", key=43
     */
    complexExpr: (r) => P.seq(r.variable, optWhitespaced(r.operator), r.value)
        .map(mapExpr)
        .desc("complex expression"),

    /**
     * Matches a value expr, e.g. "value"
     */
    valueExpr: (r) => r.quotedString
        .map((value) => mapExpr(["*", "=", value]))
        .desc("value expression"),

    /**
     * Matches a variable
     */
    variable: () => P.regex(/[a-zA-Z_]\w*/).desc("variable"),
    /**
     * Matches allowed operator
     */
    operator: () => P.alt(
        word("="),
        word("!="),
        word("<="),
        word(">="),
        word("<"),
        word(">")
    ).desc("operator"),
    /**
     * Matches a value
     * @param r
     */
    value: (r) => P.alt(
        r.quotedString,
        r.decimalNumber,
        r.number,
        r.array
    ).desc("value"),

    lsbracket: () => word("["),
    rsbracket: () => word("]"),
    lbracket: () => word("("),
    rbracket: () => word(")"),
    lbrace: () => word('{'),
    rbrace: () => word('}'),
    comma: () => word(','),

    // TODO: this regexp is not perfect, is it possible to have multiple repeatable " symbols in a string?
    quotedString: () => P.regexp(/"([^"\x00-\x1F\x7F]|[a-fA-F0-9]{4})*"/).desc("string"),
    decimalNumber: () => P.regexp(/(\d+(\.\d*)?|\d*\.\d+)/).map(Number).desc("decimal number"),
    number: () => P.regexp(/-?\d+/).map(Number).desc("number"),
    array: (r) => {
        return r.lsbracket
            .then(optWhitespaced(r.value).sepBy(r.comma))
            .skip(r.rsbracket)
            .desc("array")
    }
});

module.exports = {
    parse: (queryDSL) => QueryLang.fullExpr.tryParse(queryDSL.trim())
};
