//##################################################################
// TOKENIZER 

const TokenType = {
  Comment: 'Comment'
}

function tokenize() {
  var token = nextToken(undefined);
  while (token !== undefined) {
    addFunctionsToToken(token);
    tokens.push(token);
    token = nextToken(token);    
  }
  logme(`Finish tokenizer. Tokens: ${tokens.length}, lines: ${tokens[tokens.length-1].lie}`);
}

function nextToken(pt) {
  var li = (pt === undefined ? 0 : pt.lie);  
  var ci = (pt === undefined ? 0 : pt.cie + 1);     
  var ti = (pt === undefined ? 0 : pt.i + 1);     
  for (var i = li; i < lines.length; i++) {
    for (var y = ci; y < lines[i].length; y++) {
      var c = lines[i][y];
      if (c === " ") {
        //return t;
      }
      else if (c === '/' && lines[i][y+1] === '/') { // inline comment
        return {i: ti, li: i, lie: i, ci: y, cie: y + lines[i].substring(y).length-1, t: TokenType.Comment, v: lines[i].substring(y)};
      }
      else if (c === '{') { // block comment
        var t = {i: ti, li: i, lie: 0, ci: y, cie: 0, v: c, t: TokenType.Comment};
        y++;
        var stack = 1;
        for (; i < lines.length; i++) {
          for (; y < lines[i].length; y++) {
            c = lines[i][y];          
            if (stack === 0) {
              return t;
            }
            if (c === '{') {
              stack++;
            } 
            else if (c === '}') {
              stack--;
            }
            t.v += c;
            t.cie = y;
            t.lie = i;
          }
          t.v += '\n';
          y = 0;
        }

      }
      else if (`"'`.indexOf(c) !== -1) { // quotes
        var t = {i: ti, li: i, lie: i, ci: y, cie: 0, v: c};
        y++;
        for (; y < lines[i].length; y++) {
          t.v += lines[i][y];
          if (lines[i][y] === c) {
            if (lines[i][y+1] !== c) { 
              t.cie = y;
              t.v = t.v.toUpperCase();
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
        var t = {i: ti, li: i, lie: i, ci: y, cie:0, v: c};
        if (c === ':' && `:=`.indexOf(lines[i][y+1] !== -1)) {
          t.v += lines[i][y+1];
        }
        t.cie = t.ci+t.v.length-1;
        t.v = t.v.toUpperCase();
        return t;      
      }     
      else {
        var t = {i: ti, li: i, lie: i, ci: y, cie: 0, v: ""};
        for (; y < lines[i].length; y++) {
          if (tsep.indexOf(lines[i][y]) !== -1) {
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

function addFunctionsToToken(token) {
  token.next = function(maxIndex, v, incStack, decStack) {
    if (maxIndex === undefined) { // no params
      return tokens[this.i+1];
    }
    if (v === undefined) { // maxIndex
      return this.i + 1 > maxIndex ? undefined : tokens[this.i+1];    
    }

    var stack = 1;
    var blockStack = 0;
    for (var i = this.i + 1; i <= maxIndex; i++) {
      var t = tokens[i];
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
  token.prev = function() {
    return tokens[this.i-1];
  }

}

function nextTokenIndex(curTokIndex, maxIndex, isFirstFind) {
  var fromIndex = isFirstFind ? curTokIndex : curTokIndex + 1;
  for (var i=fromIndex; i <= maxIndex; i++) {
    if (tokens[i].t !== TokenType.Comment) {
      return i;
    }
  }
}

function lastTokenIndex(fromIndex, maxIndex) {
  var stack = 1;
  var blockStack = 0;

  for (var i = fromIndex; i <= maxIndex; i++) {
    var val = tokens[i].v.toUpperCase();
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
