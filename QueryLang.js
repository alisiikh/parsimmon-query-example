let P = require('Parsimmon');

let whitespace = P.optWhitespace.desc("whitespace (separator)");
/**
 * Token that might be wrapped with whitespaces.
 * @param parser
 */
let token = (parser) => parser.skip(whitespace);
/**
 * A string that might be wrapped with whitespaces.
 * @param str
 */
let word = (str) => P.string(str).thru(token);
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
    complexExpr: (r) => P.seq(r.variable, r.operator, r.value)
        .thru(parser => whitespace.then(parser))
        .map(mapExpr)
        .desc("complex expression"),

    /**
     * Matches a value expr, e.g. "value"
     */
    valueExpr: (r) => r.quotedString
        .thru(parser => whitespace.then(parser))
        .map((value) => mapExpr(["*", "=", value]))
        .desc("value expression"),

    /**
     * Matches a variable
     */
    variable: () => token(P.regex(/[a-zA-Z_]\w*/)).desc("variable"),
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
    quotedString: () => token(P.regexp(/"([^"\x00-\x1F\x7F]|[a-fA-F0-9]{4})*"/)).desc("string"),
    decimalNumber: () => token(P.regexp(/(\d+(\.\d*)?|\d*\.\d+)/)).map(Number).desc("decimal number"),
    number: () => token(P.regexp(/-?\d+/)).map(Number).desc("number"),
    array: (r) => {
        return r.lsbracket
            .then(r.value.sepBy(r.comma))
            .skip(r.rsbracket)
            .desc("array")
    }
});

module.exports = QueryLang;
