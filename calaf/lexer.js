//##################################################################
// TOKENIZER 

const TokenType = {
  Comment: 'Comment'
}

function tokenize() {
  let token = nextToken(undefined);
  while (token !== undefined) {
    addFunctionsToToken(token);
    tokens.push(token);
    token = nextToken(token);
  }
  logme(`Tokens: ${tokens.length}`);
}

/**
 * @param {{ i: number; li: number; lie: number; ci: number; cie: number; v: string; }} pt
 */
function nextToken(pt) {
  let li = (pt === undefined ? 0 : pt.lie);
  let ci = (pt === undefined ? 0 : pt.cie + 1);
  let ti = (pt === undefined ? 0 : pt.i + 1);
  for (let i = li; i < lines.length; i++) {
    for (let y = ci; y < lines[i].length; y++) {
      let c = lines[i][y];
      if (c === " ") {
        //return t;
      }
      else if (c === '/' && lines[i][y + 1] === '/') { // inline comment
        return { i: ti, li: i, lie: i, ci: y, cie: y + lines[i].substring(y).length - 1, t: TokenType.Comment, v: lines[i].substring(y) };
      }
      else if (c === '{') { // block comment
        let t = { i: ti, li: i, lie: 0, ci: y, cie: 0, v: c, t: TokenType.Comment };
        y++;
        let stack = 1;
        for (; i < lines.length; i++) {
          for (; y < lines[i].length; y++) {
            c = lines[i][y];
            if (c === '{') {
              stack++;
            }
            else if (c === '}') {
              stack--;
            }
            t.v += c;
            if (stack === 0) {
              t.cie = y;
              t.lie = i;
              return t;
            }

          }
          t.v += '\n';
          y = 0;
        }

      }
      else if (`"'`.indexOf(c) !== -1) { // quotes
        let t = { i: ti, li: i, lie: i, ci: y, cie: 0, v: c };
        y++;
        for (; y < lines[i].length; y++) {
          t.v += lines[i][y];
          if (lines[i][y] === c) {
            if (lines[i][y + 1] !== c) {
              t.cie = y;
              //t.v = t.v.toUpperCase();
              return t;
            }
            else {
              t.v += lines[i][y];
              y++;
            }
          }
        }
      }
      else if (op.indexOf(c) !== -1) { // operators
        let t = { i: ti, li: i, lie: i, ci: y, cie: 0, v: c };
        if (c === ':' && `:=`.indexOf(lines[i][y + 1]) !== -1) {
          t.v += lines[i][y + 1];
        }
        t.cie = t.ci + t.v.length - 1;
        //t.v = t.v.toUpperCase();
        return t;
      }
      else {
        let t = { i: ti, li: i, lie: i, ci: y, cie: 0, v: "" };
        for (; y < lines[i].length; y++) {
          if (tsep.indexOf(lines[i][y]) !== -1) {
            t.v = t.v.toUpperCase();
            return t;
          }
          else {
            t.cie = y;
            t.v += lines[i][y];
          }
        }
        t.v = t.v.toUpperCase();
        return t;
      }
    }
    ci = 0;
  }
}

/**
 * @param {{ i: number; li: number; lie: number; ci: number; cie: number; v: any; next?: function; prev?: function; }} token
 */
function addFunctionsToToken(token) {

  token.next = function (/** @type {number} */ maxIndex, /** @type {string} */ v, /** @type {string[]} */ incStack, /** @type {string[]} */ decStack) {
    if (maxIndex === undefined) { // no params
      let i = this.i + 1;
      while (tokens[i].t === TokenType.Comment) {
        i++;
      }
      return tokens[i];
    }
    if (v === undefined) { // maxIndex
      //return this.i + 1 > maxIndex ? undefined : tokens[this.i+1];    
      let i = this.i + 1;
      while (tokens[i].t === TokenType.Comment) {
        i++;
        if (i > maxIndex) {
          return undefined;
        }
      }
      return tokens[i];
    }

    let stack = 1;
    let blockStack = 0;
    for (let i = this.i + 1; i <= maxIndex; i++) {
      let t = tokens[i];
      if (t.v === v.toUpperCase() && blockStack <= 0) {
        stack--;
        if (blockStack <= 0 && stack === 0) {
          return tokens[i];
        }
      }
      else if (incStack !== undefined && incStack.indexOf(t.v) !== -1 && blockStack <= 0) {
        stack++;
      }
      else if (decStack !== undefined && decStack.indexOf(t.v) !== -1 && blockStack <= 0) {
        stack--;
      }

      if (startBlocks.indexOf(t.v) !== -1) {
        blockStack++;
      }
      else if (endBlocks.indexOf(t.v) !== -1) {
        blockStack--;
      }
      if (blockStack <= 0 && stack === 0) {
        return token[i];
      }
    }
  }

  token.prev = function (/** @type {string} */ searchExp) {
    for (let i = this.i - 1; i >= 0; i--) {
      let t = tokens[i];
      if (t.t !== TokenType.Comment && (t.v === searchExp || searchExp === undefined)) {
        return t;
      }
    }
  }

}

/**
 * @param {number} curTokIndex
 * @param {number} maxIndex
 * @param {boolean} isFirstFind
 */
function nextTokenIndex(curTokIndex, maxIndex, isFirstFind) {
  let fromIndex = isFirstFind ? curTokIndex : curTokIndex + 1;
  for (let i = fromIndex; i <= maxIndex; i++) {
    if (tokens[i].t !== TokenType.Comment) {
      return i;
    }
  }
}

/**
 * @param {number} fromIndex
 * @param {number} maxIndex
 */
function lastTokenIndex(fromIndex, maxIndex) {
  let stack = 1;
  let blockStack = 0;

  for (let i = fromIndex; i <= maxIndex; i++) {
    let val = tokens[i].v.toUpperCase();
    if (startBlocks.indexOf(val) !== -1) {
      stack++;
      blockStack++;
    }
    else if (endBlocks.indexOf(val) !== -1) {
      stack--;
      blockStack--;
    }

    if (val === ';' && blockStack === 0) {
      stack--;
    }
    if (stack === 0) {
      return i;
    }
  }
}

/**
 * Get token from specified line number and char index
 * @param {number} li Line index
 * @param {number} ci Char index
 */
function getTokenFromPos(li, ci) {
  let tok;
  tokens.forEach(t => {
    if (li >= t.li && li <= t.lie && ci >= t.ci && ci <= t.cie) {
      tok = t;
      return;
    }
  });
  return tok;
}
