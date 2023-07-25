"use strict";
//##################################################################
// PARSER 

function parse() {
    statements.push(findStatements(0, tokens.length - 1));
}

function findStatements(minIndex, maxIndex) {
    //debugger;
    var ss = [];
    var s = nextstatement(minIndex, maxIndex, true);
    while (s !== undefined) {
        parseStatement(s);
        ss.push(s);
        s = nextstatement(s.li, maxIndex, false);
    }
    return ss;
}

function nextstatement(minIndex, maxIndex, isFirstFind) {
    var firstIndex = nextTokenIndex(minIndex, maxIndex, isFirstFind);
    if (firstIndex === undefined) {
        return undefined;
    }
    var lastIndex = lastTokenIndex(firstIndex, maxIndex);
    lastIndex = lastIndex === undefined ? maxIndex : lastIndex;
    return { fi: firstIndex, li: lastIndex, statements: [] };
}


function parseStatement(s) {
    //debugger;
    switch (tokens[s.fi].v.toUpperCase()) {
        case "IF":
            parseIf(s);
            break;
        /*
            case "REPEAT":
              parseRepeat(s);
              break;
            case "CASE":
              parseCase(s);
              break;
            case "WITH":
              parseWith(s);
              break;
            case "FOR":
              parseFor(s);
              break;
            case "WHILE":
              parseWhile(s);
              break;
        */
        default:
            parseNoncmd(s);
            break;
    }
}

function parseIf(s) {    
    var ifTok = tokens[s.fi];
    var thenTok = ifTok.next(s.li, "THEN");
    if (thenTok.li - ifTok.li > 1) {
        increaseLineIndent(ifTok.li + 1, thenTok.li - 1);
    }

    var thenBegin = thenTok.next().v === "BEGIN";
    var thenBeginTok = thenBegin ? thenTok.next() : undefined;
    var thenEndTok = thenBegin ? thenBeginTok.next(s.li, "END") : undefined;
    var elseTok;
    if (thenBegin) {
        var nextTok = thenEndTok.next();
        if (nextTok !== undefined && nextTok.v === "ELSE") {
            elseTok = nextTok;
        }
        else {
            elseTok = thenTok.next(s.li, "ELSE", ["IF"], ["ELSE"]);
        }
    }
    else {
        elseTok = thenTok.next(s.li, "ELSE", ["IF"], ["ELSE"]);
    }

    var elseBegin = elseTok !== undefined && elseTok.next(s.li).v === "BEGIN";
    var elseBeginTok = elseBegin ? elseTok.next(s.li) : undefined;
    var elseEndTok = elseBegin ? tokens[s.li].prev() : undefined;

    var fromLineIndex, toLineIndex;

    // indentation
    if (elseTok === undefined) {
        // then
        fromLineIndex = thenBegin ? thenBeginTok.li + 1 : thenTok.li + 1;
        toLineIndex = thenBegin ? thenEndTok.li - 1 : tokens[s.li].li;
        increaseLineIndent(fromLineIndex, toLineIndex);
    }
    else {
        // then        
        if (elseTok.li - thenTok.li > 1 || (elseTok.li - thenTok.li === 1 && elseTok.li === tokens[s.li].li)) {
            fromLineIndex = thenBegin ? thenBeginTok.li + 1 : thenTok.li + 1;
            toLineIndex = thenBegin ? thenEndTok.li - 1 : elseTok.li - (elseTok.li - thenTok.li === 1 && elseTok.li === tokens[s.li].li && elseTok.ci > 0 ? 0 : 1);            
            increaseLineIndent(fromLineIndex, toLineIndex);
        }
        // else                        
        fromLineIndex = elseBegin ? elseBeginTok.li + 1 : elseTok.li + 1;
        toLineIndex = elseBegin ? elseEndTok.li - 1 : tokens[s.li].li;
        increaseLineIndent(fromLineIndex, toLineIndex);
    }

    // subtree recursive
    if (thenBegin) {
        s.statements.push(findStatements(thenBeginTok.next(s.li).i, thenEndTok.prev().i));
    }
    if (elseTok === undefined && !thenBegin && thenTok.li < tokens[s.li].li) {
        s.statements.push(findStatements(thenTok.next(s.li).i, s.li));
    }
    //if (elseTok != undefined && thenTok.li < elseTok.li && !thenBegin) {
    if (elseTok !== undefined && !thenBegin) {
        s.statements.push(findStatements(thenTok.next(s.li).i, elseTok.prev().i));
    }
    //if (elseTok != undefined && elseTok.li < tokens[s.li].li && !elseBegin)
    if (elseTok !== undefined && !elseBegin) {
        s.statements.push(findStatements(elseTok.next(s.li).i, s.li));
    }
    if (elseBegin) {
        s.statements.push(findStatements(elseBeginTok.next(elseEndTok.i).i, elseEndTok.prev().i));
    }
}

function parseNoncmd(s) {
    if (tokens[s.fi].li !== tokens[s.li].li) {
        increaseLineIndent(tokens[s.fi].li + 1, tokens[s.li].li);
    }
}

