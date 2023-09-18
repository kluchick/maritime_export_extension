console.log("Start of background.js");
var collectedItems = [];

// Listen for messages from content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'sendData') {
    const receivedData = request.data;
    collectedItems.push(receivedData);
    console.log('Sending updateRecordCount message to popup.js:', collectedItems.length);
    chrome.runtime.sendMessage({ action: 'updateRecordCount', count: collectedItems.length });
  }
});

// Listen for saveData messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveData') {
//    console.log('Received saveData message from popup.js:', collectedItems);
    saveData(collectedItems);
    collectedItems=[];
  }
});

function saveData(data) {
//    var csv = 'Time Spent \t Jira Item \t Entered Date\n';
    var csv ='';
    data.forEach(function(row) {
            csv += row.timeSpent + '\t' + row.jiraItem + ' ' + row.description + '\t' + row.enteredDate + "\n";
    });
    console.log("CSV file is:",csv);
      // Create a Blob containing the CSV data
      const blob = new Blob([csv], { type: 'text/csv' });
      const filename = 'maritime_export.csv';
      const url = chrome.runtime.getURL(filename);
      const dataURI = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

     chrome.downloads.download({
        url: dataURI,
        filename: filename,
        saveAs: true,
        conflictAction: 'uniquify', // To ensure a unique filename
      });

}

