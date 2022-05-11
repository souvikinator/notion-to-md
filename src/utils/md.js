"use strict";
exports.__esModule = true;
exports.table = exports.tableRowBody = exports.tableRowHeader = exports.divider = exports.addTabSpace = exports.image = exports.todo = exports.bullet = exports.callout = exports.quote = exports.heading3 = exports.heading2 = exports.heading1 = exports.codeBlock = exports.link = exports.underline = exports.strikethrough = exports.italic = exports.bold = exports.inlineCode = void 0;
var inlineCode = function (text) {
    return "`".concat(text, "`");
};
exports.inlineCode = inlineCode;
var bold = function (text) {
    return "**".concat(text, "**");
};
exports.bold = bold;
var italic = function (text) {
    return "_".concat(text, "_");
};
exports.italic = italic;
var strikethrough = function (text) {
    return "~~".concat(text, "~~");
};
exports.strikethrough = strikethrough;
var underline = function (text) {
    return "<u>".concat(text, "</u>");
};
exports.underline = underline;
var link = function (text, href) {
    return "[".concat(text, "](").concat(href, ")");
};
exports.link = link;
var codeBlock = function (text, language) {
    return "```".concat(language, "\n").concat(text, "\n```");
};
exports.codeBlock = codeBlock;
var heading1 = function (text) {
    return "# ".concat(text);
};
exports.heading1 = heading1;
var heading2 = function (text) {
    return "## ".concat(text);
};
exports.heading2 = heading2;
var heading3 = function (text) {
    return "### ".concat(text);
};
exports.heading3 = heading3;
var quote = function (text) {
    // the replace is done to handle multiple lines
    return "> ".concat(text.replace(/\n/g, "  \n>"));
};
exports.quote = quote;
var callout = function (text, icon) {
    var emoji;
    if ((icon === null || icon === void 0 ? void 0 : icon.type) === 'emoji') {
        emoji = icon.emoji;
    }
    // the replace is done to handle multiple lines
    return "> ".concat(emoji ? emoji + ' ' : '').concat(text.replace(/\n/g, "  \n>"));
};
exports.callout = callout;
var bullet = function (text) {
    return "- ".concat(text);
};
exports.bullet = bullet;
var todo = function (text, checked) {
    return checked ? "- [x] ".concat(text) : "- [ ] ".concat(text);
};
exports.todo = todo;
var image = function (alt, href) {
    return "![".concat(alt, "](").concat(href, ")");
};
exports.image = image;
var addTabSpace = function (text, n) {
    if (n === void 0) { n = 0; }
    var tab = "	";
    for (var i = 0; i < n; i++) {
        if (text.includes("\n")) {
            var multiLineText = text.split(/(?<=\n)/).join(tab);
            text = tab + multiLineText;
        }
        else
            text = tab + text;
    }
    return text;
};
exports.addTabSpace = addTabSpace;
var divider = function () {
    return "---";
};
exports.divider = divider;
var tableRowHeader = function (row) {
    var header = row.join("|");
    var divider = row.map(function (_) { return "---"; }).join("|");
    return "".concat(header, "\n").concat(divider);
};
exports.tableRowHeader = tableRowHeader;
var tableRowBody = function (row) {
    return row.join("|");
};
exports.tableRowBody = tableRowBody;
var table = function (cells) {
    var tableRows = cells.map(function (row, i) {
        return !i ? (0, exports.tableRowHeader)(row) : (0, exports.tableRowBody)(row);
    });
    return tableRows.join("\n");
};
exports.table = table;
