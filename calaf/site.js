var screenSize = 132;
var textarea, logt;
var tokens = [];
const indentSpaces = 2;
var lines = [];
var linesIndent = [];
var linesTouched = [];
var statements = [];
var editor;
var touchedLinesCount = 0;

function indent() {
  reset(true);  
  let scrollInfo = editor.getScrollInfo();
  let eTop = scrollInfo.top;
  let eLeft = scrollInfo.left;
  lines = editor.getValue().split('\n');
  tokenize();
  parse(loadSettings());
  touchedLinesCount = printResult();
  editor.scrollTo(eLeft, eTop);
  logme(`Touched lines: <a href="#" onclick="showDiff();">${touchedLinesCount}</a>`);
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
    editor.setValue(demoCode);
  }
}


function makeMarker() {
  var marker = document.createElement("div");
  marker.style.color = "#822";
  marker.innerHTML = "*";
  return marker;
}


/**
 * @param {boolean} [isClearLog]
 */
function reset(isClearLog) {
  linesIndent = [];
  linesTouched = [];
  lines = [];
  tokens = [];
  statements = [];
  touchedLinesCount = 0;
  if (isClearLog) {
    clearLog();
  }    
}

function clear2() {
  reset(true);
  textarea.value = "";  
  editor.getWrapperElement().style.display = "block";
  document.getElementById("view").style.display = "none";
  editor.setValue("");
}

function printResult() {
  textarea.value = "";
  let difCount = 0;  
  let initialIndent = tokens[0].ci;
  for (var i = 0; i < lines.length; i++) {
    let resLine = "";
    if (linesIndent[i] !== undefined) {
      resLine += " ".repeat(linesIndent[i]);
    }
    if (lines[i].trimLeft().length > 0) {
      resLine += " ".repeat(initialIndent);
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

function clearLog() {
  logt.innerHTML = "";
}

var value, orig1, orig2, dv;
function showDiff() {  
  let value = editor.getValue();
  let orig1 = value;
  let orig2 = lines.join("\n");

  let scrollInfo = editor.getScrollInfo();
  let eTop = scrollInfo.top;
  let eLeft = scrollInfo.left;

  editor.getWrapperElement().style.display = "none";
  document.getElementById("view").style.display = "inline";  

  if (value == null) return;
  var target = document.getElementById("view");
  target.innerHTML = "";
  dv = CodeMirror.MergeView(target, {
    value: value,
    origLeft:  null,
    orig: orig2,
    lineNumbers: true,
    highlightDifferences: true,
    mode: "text/cal"
  });
  dv.editor().scrollTo(eLeft, eTop);

  let editor2 = dv.editor();
  for (var i = 0; i < lines.length; i++) {
    if (linesTouched[i] !== undefined) {
      editor2.addLineClass(i, "gutter", "TouchedLine")      
    }    
  }
  
  clearLog();
  logme(`<a href="#" onclick="hideDiffTool();">close</a>`);  
}

function hideDiffTool() {
  let scrollInfo = dv.editor().getScrollInfo();
  let eTop = scrollInfo.top;
  let eLeft = scrollInfo.left;

  editor.getWrapperElement().style.display = "block";
  document.getElementById("view").style.display = "none";  
  editor.scrollTo(eLeft, eTop);
  clearLog();
  logme(`Touched lines: <a href="#" onclick="showDiff();">${touchedLinesCount}</a>`);
 
}