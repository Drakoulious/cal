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
  logt.innerHTML = `Total ${totalCount}, Passed: ${passedCount}, Failure: ${totalCount - passedCount}<br><br>` + logt.innerHTML;
}

function runTestById(id) {
  reset(false);
  textarea.value = testData[id];
  lines = testData[id].split('\n');
  tokenize();
  parse();
  let diffCount = printResult();
  let passed = diffCount === 0;
  if (!passed) {
    textarea.value += `\n\nExpected:\n${testData[id]}`;
  }
  logme(`<font color="${passed ? `green` : `red`}"><a href="#" onclick="reset(true);textarea.style.display = 'inline';runTestById(${id});">Test#${id}</a>, Touched lines: ${diffCount}, Tokens: ${tokens.length}, Passed: ${passed} </font>`);
  return passed;
}
