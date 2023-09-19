document.addEventListener('DOMContentLoaded', function () {
  // Add a click event listener to the button
  const collectButton = document.getElementById('collectData');
  const saveButton = document.getElementById('saveData');
  const recordCountLabel = document.getElementById('recordCount');

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'updateRecordCount') {
      const newCount = request.count;
      recordCountLabel.textContent = `${newCount}`;
    }
  });

  chrome.runtime.sendMessage({ action: 'popupLoaded' });

  collectButton.addEventListener('click', function () {
    // Send a message to content.js
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: function () {
          // This code will be executed in the active tab's content script
          // Call your function in content.js here
          parseMaritimePage();
        },
      });
    });
  }
  );

  saveButton.addEventListener('click', function () {
    // Send a message to background.js
    chrome.runtime.sendMessage({ action: 'saveData' });
  });
});

