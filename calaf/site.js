var screenSize = 132;
var textarea, logt;
var tokens = [];
const indentSpaces = 2;
var lines = [];
var linesIndent = [];
var linesTouched = [];
var statements = [];
var editor;


function indent() {
  loadSettings();
  reset(true);  
  lines = editor.getValue().split('\n');
  tokenize();
  parse(loadSettings());

  logme(`Touched lines: ${printResult()}`);
}

/**
 * @param {boolean} loadSample
 */
function init(loadSample) {
  textarea = document.getElementById('editor');  

  // CodeMirror
  editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    gutters: ["CodeMirror-linenumbers", "breakpoints"],
    mode: "text/cal",
    highlightSelectionMatches: {annotateScrollbar: true }
  });
  //editor.setSize("100%", "80%");  

  logt = document.getElementById('log');

  if (loadSample) {
    editor.setValue(`IF NOT DimMgt.CheckDocDimComb(TempDocDim) THEN
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
`);
  }
}


function makeMarker() {
  var marker = document.createElement("div");
  marker.style.color = "#822";
  marker.innerHTML = "*";
  return marker;
}


/**
 * @param {boolean} [clearLog]
 */
function reset(clearLog) {
  linesIndent = [];
  linesTouched = [];
  lines = [];
  tokens = [];
  statements = [];
  if (clearLog) {
    logt.innerHTML = "";
  }  
}

function clear2() {
  reset(true);
  textarea.value = "";
  editor.setValue("");
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
    if (t !== undefined && t.t === TokenType.Comment && t.li !== t.lie) {      
      resLine = resLine.substring(0, resLine.length - linesIndent[i])
      resLine += lines[i];
    }
    else {
      resLine += lines[i].trimLeft();
    }
    if (lines[i] !== resLine) {
      linesTouched[i] = 1;
      difCount++;      
    }
    if (i < lines.length - 1) {
      resLine += '\n';
    }
    textarea.value += resLine;

  }  
  editor.setValue(textarea.value);
  for (var i = 0; i < lines.length; i++) {
    if (linesTouched[i] !== undefined) {
      editor.addLineClass(i, "gutter", "TouchedLine")
      //editor.setGutterMarker(i, "breakpoints", makeMarker());
    }    
  }
  
  return difCount;
}

/**
 * @param {number} sli Start line index
 * @param {number} eli End line index
 * @param {number} [addIndent]
 */
function increaseLineIndent(sli, eli, addIndent) {
  //console.log(`${sli+1} ${eli+1} ${addIndent} ${(new Error()).stack}`);
  for (var i = sli; i <= eli; i++) {
    if (lines[i].length > 0) {
      if (linesIndent[i] === undefined) {
        linesIndent[i] = 0;
      }
      linesIndent[i] += addIndent !== undefined ? addIndent : indentSpaces;
    }
  }
}

/**
 * @param {number} sli Start line index
 * @param {number} eli End line index
 * @param {number} [decIndent]
 */
function decreaseLineIndent(sli, eli, decIndent) {
  for (var i = sli; i <= eli; i++) {
    if (lines[i].length > 0) {
      if (linesIndent[i] === undefined) {
        linesIndent[i] = 0;
      }
      linesIndent[i] -= decIndent !== undefined ? decIndent : indentSpaces;
    }
  }
}

/**
 * @param {string} v
 */
function logme(v) {
  logt.innerHTML += v + '<br>';
}

