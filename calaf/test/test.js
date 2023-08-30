"use strict";

function runTest() {
  reset(true);  
  let passedCount = 0, totalCount = 0;    
  for (let i = 0; i < testData.length; i++) {
    totalCount++;
    if (runTestById(i)) {
      passedCount++;
    }
  }
  editor.setValue("");  
  document.getElementById('settings').innerHTML = "";
  logt.innerHTML = `Total ${totalCount}, Passed: ${passedCount}, Failure: ${totalCount - passedCount}<br><br>` + logt.innerHTML;
}

function runTestById(id) {
  reset(false);
  let test = testData[id];
  editor.setValue(test.data);
  document.getElementById('settings').innerHTML = JSON.stringify(test.settings);
  lines = test.data.split('\n');  
  tokenize();
  parse(test.settings);
  let diffCount = printResult();
  let passed = diffCount === 0;
  if (!passed) {    
    editor.setValue(editor.getValue() + `\n\n############ Expected: ############\n${testData[id].data}`);
    for (var i = 0; i < lines.length; i++) {
      if (linesTouched[i] !== undefined) {
        editor.setGutterMarker(i, "breakpoints", makeMarker());
      }    
    }
  }  
  logme(`<font color="${passed ? `green` : `red`}"><a href="#" onclick="reset(true);runTestById(${id});event.preventDefault();">Test#${id}</a>, Touched lines: ${diffCount}, Tokens: ${tokens.length}, Passed: ${passed} </font>`);
  return passed;
}
