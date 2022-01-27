// When the button is clicked trigger the solve Wordle code.
document.getElementById("solveWordle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content-script.js']
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  console.log('Solve that Wordle!')
}
