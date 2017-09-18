let QueryLang = require('./QueryLang');

let QueryParser = {
    parse: (queryDSL) => QueryLang.fullExpr.tryParse(queryDSL.trim())
};

module.exports = QueryParser;
