var screenSize = 132;
var src, res, logt;
var tokens = [];
const indentSpaces = 2;
var lines = [];
var linesIndent = [];
var statements = [];


function indent() {
  reset();
  lines = src.value.split('\n');  
  tokenize();
  parse();
  printResult();  
  //tokens.forEach(t => res.value += JSON.stringify(t) + '\n');
}

function init() {
  src = document.getElementById('source');
  res = document.getElementById('result');
  logt = document.getElementById('log');
    src.value = `
IF NOT DimMgt.CheckDocDimComb(TempDocDim) THEN
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
  res.value = "";
  logt.value = "";
}

function printResult() {
  res.value = "";
  for (var i = 0; i < lines.length; i++) {
    if (linesIndent[i] !== undefined) {
      res.value += " ".repeat(linesIndent[i]);
    }
    res.value += lines[i].trimLeft() + '\n';
  }
}

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

function logme(v) {
  logt.value += v + '\n';
}