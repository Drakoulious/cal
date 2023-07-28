"use strict";

function runTest() {
  reset(true);
  textarea.style.display = "none";
  let passedCount = 0, totalCount = 0;
  for (let i = 0; i < testData.length; i++) {
    totalCount++;
    if (runTestById(i)) {
      passedCount++;
    }
  }
  textarea.value = "";
  document.getElementById('settings').innerHTML = "";
  logt.innerHTML = `Total ${totalCount}, Passed: ${passedCount}, Failure: ${totalCount - passedCount}<br><br>` + logt.innerHTML;
}

function runTestById(id) {
  reset(false);
  let test = testData[id];
  textarea.value = test.data;
  document.getElementById('settings').innerHTML = JSON.stringify(test.settings);
  lines = test.data.split('\n');
  tokenize();
  parse(test.settings);
  let diffCount = printResult();
  let passed = diffCount === 0;
  if (!passed) {
    textarea.value += `\n\n############ Expected: ############\n${testData[id].data}`;
  }
  logme(`<font color="${passed ? `green` : `red`}"><a href="#" onclick="reset(true);textarea.style.display = 'inline';runTestById(${id});">Test#${id}</a>, Touched lines: ${diffCount}, Tokens: ${tokens.length}, Passed: ${passed} </font>`);
  return passed;
}
