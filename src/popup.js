document.addEventListener('DOMContentLoaded', function () {
  // Add a click event listener to the button
  const collectButton = document.getElementById('collectData');
  const saveButton = document.getElementById('saveData');
  const recordCountLabel = document.getElementById('recordCount');
  const fillGapsCheckbox = document.getElementById('fillGaps');
  const defaultTaskInput = document.getElementById('defaultTask');

  // Handle checkbox change to enable/disable text input
  fillGapsCheckbox.addEventListener('change', function() {
    defaultTaskInput.disabled = !fillGapsCheckbox.checked;
    if (!fillGapsCheckbox.checked) {
      defaultTaskInput.value = '';
    }
  });

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
    // Get the checkbox and text input values
    const gapFillOptions = {
      fillGaps: fillGapsCheckbox.checked,
      defaultTask: defaultTaskInput.value
    };
    
    // Send a message to background.js with gap fill options
    chrome.runtime.sendMessage({ 
      action: 'saveData',
      gapFillOptions: gapFillOptions
    });
  });
});

