var screenSize = 132;
var textarea, logt;
var tokens = [];
const indentSpaces = 2;
var lines = [];
var linesIndent = [];
var statements = [];


function indent() {
  reset();
  lines = textarea.value.split('\n');
  tokenize();
  parse();
  printResult();  
}

function init() {
  textarea = document.getElementById('editor');  
  logt = document.getElementById('log');  
  textarea.value = `IF NOT DimMgt.CheckDocDimComb(TempDocDim) THEN
IF LineNo = 0 THEN
ERROR(
Text028,
SalesHeader."Document Type",SalesHeader."No.",DimMgt.GetDimCombErr)
ELSE
ERROR(
Text029,
SalesHeader."Document Type",SalesHeader."No.",LineNo,DimMgt.GetDimCombErr);


IF "Bill-to Customer No." <> "Sell-to Customer No." THEN BEGIN
Cust.GET("Bill-to Customer No.");
IF Receive THEN
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",FALSE,TRUE)
ELSE BEGIN
IF Ship THEN BEGIN
SalesLine.RESET;
SalesLine.SETRANGE("Document Type","Document Type");
SalesLine.SETRANGE("Document No.","No.");
SalesLine.SETFILTER(SalesLine."Qty. to Ship",'<>0');
IF SalesLine.FIND('-') THEN
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",TRUE,TRUE);
END ELSE
Cust.CheckBlockedCustOnDocs(Cust,"Document Type",FALSE,TRUE);
END;
END;
`;
}

function reset() {
  linesIndent = [];
  lines = [];
  tokens = [];
  statements = [];  
  logt.innerHTML = "";
  
}

function clear2() {
  reset();  
  textarea.value = "";
}

function printResult() {
  textarea.value = "";
  let difCount = 0;
  for (var i = 0; i < lines.length; i++) {
    let resLine = "";
    if (linesIndent[i] !== undefined) {
      resLine += " ".repeat(linesIndent[i]);
    }
    let t = getTokenFromPos(i, 0);
    if (t !== undefined && t.t === TokenType.Comment) {
      resLine += lines[i];
    }
    else {
      resLine += lines[i].trimLeft();
    }
    if (lines[i] !== resLine) {
      difCount++;
    }
    if (i < lines.length - 1) {
      resLine += '\n';
    }
    textarea.value += resLine;

  }
  logme(`Lines changed: ${difCount} of ${lines.length}`)
}

/**
 * @param {number} sli Start line index
 * @param {number} eli End line index
 */
function increaseLineIndent(sli, eli) {
  for (var i = sli; i <= eli; i++) {
    if (lines[i].length > 0) {
      if (linesIndent[i] === undefined) {
        linesIndent[i] = 0;
      }
      linesIndent[i] += indentSpaces;
    }
  }
}

/**
 * @param {string} v
 */
function logme(v) {
  logt.innerHTML += v + '<br>';
}