const QueryLang = require('./QueryLang');

class QueryParser {
    parse(queryDSL) {
        return QueryLang.fullExpr.tryParse(queryDSL.trim());
    }
}

module.exports = QueryParser;
