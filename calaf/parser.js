"use strict";
//##################################################################
// PARSER 

function parse() {
    statements.push(findStatements(0, tokens.length - 1));
}

/**
 * @param {number} minIndex
 * @param {number} maxIndex
 */
function findStatements(minIndex, maxIndex) {
    //debugger;
    let ss = [];
    let s = nextstatement(minIndex, maxIndex, true);
    while (s !== undefined) {
        parseStatement(s);
        ss.push(s);
        s = nextstatement(s.li, maxIndex, false);
    }
    return ss;
}

/**
 * @param {number} minIndex
 * @param {number} maxIndex
 * @param {boolean} isFirstFind
 */
function nextstatement(minIndex, maxIndex, isFirstFind) {
    let firstIndex = nextTokenIndex(minIndex, maxIndex, isFirstFind);
    if (firstIndex === undefined) {
        return undefined;
    }
    let lastIndex = lastTokenIndex(firstIndex, maxIndex);
    lastIndex = lastIndex === undefined ? maxIndex : lastIndex;
    return { fi: firstIndex, li: lastIndex, statements: [] };
}


/**
 * @param {{ fi: number; li: number; statements: any[]; }} s
 */
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
              */
        case "CASE":
            parseCase(s);
            break;
        /*
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

/**
 * @param {{ fi: number; li: number; statements: { fi: number; li: number; statements: any[]; }[][]; }} s
 */
function parseIf(s) {
    let ifTok = tokens[s.fi];
    let thenTok = ifTok.next(s.li, "THEN");
    if (thenTok.li - ifTok.li > 1) {
        increaseLineIndent(ifTok.li + 1, thenTok.li - 1);
    }
    //debugger;
    let thenBegin = thenTok.next().v === "BEGIN";
    let thenBeginTok = thenBegin ? thenTok.next() : undefined;
    let thenEndTok = thenBegin ? thenBeginTok.next(s.li, "END") : undefined;
    let elseTok;
    if (thenBegin) {
        let nextTok = thenEndTok.next();
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

    let elseBegin = elseTok !== undefined && elseTok.next(s.li).v === "BEGIN";
    let elseBeginTok = elseBegin ? elseTok.next(s.li) : undefined;
    let elseEndTok = elseBegin ? tokens[s.li].prev() : undefined;

    let fromLineIndex, toLineIndex;

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
    if (elseTok !== undefined && !thenBegin) {
        s.statements.push(findStatements(thenTok.next(s.li).i, elseTok.prev().i));
    }
    if (elseTok !== undefined && !elseBegin) {
        s.statements.push(findStatements(elseTok.next(s.li).i, s.li));
    }
    if (elseBegin) {
        s.statements.push(findStatements(elseBeginTok.next(elseEndTok.i).i, elseEndTok.prev().i));
    }
}

/**
 * @param {{ fi: string | number; li: string | number; }} s
 */
function parseNoncmd(s) {
    if (tokens[s.fi].li !== tokens[s.li].li) {
        increaseLineIndent(tokens[s.fi].li + 1, tokens[s.li].li);
    }
}

/**
 * @param {{ fi: number; li: number; statements: any[]; }} s
 */
function parseCase(s) {
    // Programming Conventions
    // https://learn.microsoft.com/en-us/dynamics-nav/c-al-conditional-statements#case-statements
    let caseTok = tokens[s.fi];
    let ofTok = caseTok.next(s.li, "OF");
    let endTok = ofTok.next(s.li, "END");
    let elseTok = ofTok.next(s.li, "ELSE");;

    increaseLineIndent(ofTok.li + 1, endTok.li - 1);

    // colons 
    let colons = [];
    let colonTok = ofTok.next(s.li, ":");
    while (colonTok !== undefined) {
        colons.push(colonTok);
        colonTok = colonTok.next(s.li, ":");
    }
    for (let i = 0; i < colons.length; i++) {
        colonTok = colons[i];
        let colonBegin = colonTok.next(endTok.i).v === "BEGIN";
        let colonBeginTok = colonTok.next(endTok.i);
        var colonEndTok = colonBegin ? colonBeginTok.next(s.li, "END") : null;
        if (colonBegin && colonBeginTok.li === colonTok.li) {
            increaseLineIndent(colonBeginTok.li + 1, colonEndTok.li - 1);
            s.statements.push(findStatements(colonBeginTok.next(colonEndTok.i).i, colonEndTok.prev().i));
        }
        else if (colonBegin) {
            increaseLineIndent(colonBeginTok.li, colonEndTok.li);
            increaseLineIndent(colonBeginTok.li + 1, colonEndTok.li - 1);
            s.statements.push(findStatements(colonBeginTok.next(colonEndTok.i).i, colonEndTok.prev().i));
        }
        else if (!colonBegin) {
            if (i < colons.length - 1) {
                let colonLastTok = colons[i + 1].prev(";");
                increaseLineIndent(colonTok.li + 1, colonLastTok.li);
                s.statements.push(findStatements(colonTok.next(colonLastTok.i).i, colonLastTok.i));
            }
            else {
                if (elseTok === undefined) {
                    increaseLineIndent(colonTok.li + 1, endTok.li - 1);
                    s.statements.push(findStatements(colonTok.next(endTok.prev().i).i, endTok.prev().i));
                }
                else {
                    increaseLineIndent(colonTok.li + 1, elseTok.li - 1);
                    s.statements.push(findStatements(colonTok.next(elseTok.prev().i).i, elseTok.prev().i));
                }
            }

        }
    }

    // else
    if (elseTok != null) {
        let elseBegin = elseTok.next(s.li).v === "BEGIN";
        if (elseBegin) {
            let elseBeginTok = elseTok.next(endTok.i);
            let elseEndTok = elseBeginTok.next(s.li, "END");
            increaseLineIndent(elseBeginTok.li + 1, elseEndTok.li - 1);
            s.statements.push(findStatements(elseBeginTok.next(elseEndTok.i).i, elseEndTok.prev().i));
        }
        else {
            increaseLineIndent(elseTok.li + 1, endTok.li - 1);
            s.statements.push(findStatements(elseTok.next(endTok.i).i, endTok.prev().i));

        }
    }
}

