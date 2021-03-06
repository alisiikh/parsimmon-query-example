let P = require('parsimmon');

const optWhitespace = P.optWhitespace.desc("whitespace");
const whitespace = P.whitespace.desc("separator");
const word = (str) => P.string(str);

/**
 * A token that might be wrapped with whitespaces.
 * @param parser
 */
const optWhitespaced = (parser) => optWhitespace.then(parser).skip(optWhitespace);
const mapExpr = (results) => {
    return {
        "var": results[0],
        "operation": results[1],
        "value": results[2]
    }
};

// Turn escaped characters into real ones (e.g. "\\n" becomes "\n").
// Taken from https://github.com/jneen/parsimmon/blob/master/examples/json.js#L11
const interpretEscapes = (str) => {
    const escapes = {
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };
    return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
        const type = escape.charAt(0);
        const hex = escape.slice(1);
        if (type === 'u') {
            return String.fromCharCode(parseInt(hex, 16));
        }
        if (escapes.hasOwnProperty(type)) {
            return escapes[type];
        }
        return type;
    });
};


const QueryLang = P.createLanguage({
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
        r.array,
        r.dateExpr
    ).desc("value"),

    dateExpr: (r) => r.lbracket
        .then(P.seq(optWhitespaced(r.date), word('-'), optWhitespaced(r.date)))
        .skip(r.rbracket).map(results => {
            return [Date.parse(results[0]), results[1], Date.parse(results[2])];
        }),

    lsbracket: () => word("["),
    rsbracket: () => word("]"),
    lbracket: () => word("("),
    rbracket: () => word(")"),
    lbrace: () => word('{'),
    rbrace: () => word('}'),
    comma: () => word(','),

    date: () => word("'").then(P.regexp(/\d{4}-\d{2}-\d{2}/)).skip(word("'")),
    quotedString: () => P.regexp(/"((?:\\.|.)*?)"/).map(interpretEscapes).desc("string"),
    decimalNumber: () => P.regexp(/-?(\d+(\.\d*)?|\d*\.\d+)/).map(Number).desc("decimal number"),
    number: () => P.regexp(/-?\d+/).map(Number).desc("number"),
    array: (r) => {
        return r.lsbracket
            .then(optWhitespaced(r.value).sepBy(r.comma))
            .skip(r.rsbracket)
            .desc("array")
    }
});

module.exports = QueryLang;
