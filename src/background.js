console.log("Start of background.js");
var collectedItems = [];

// Listen for popupLoaded messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case 'popupLoaded':
      // Listen for popupLoaded messages from popup.js
      chrome.runtime.sendMessage({ action: 'updateRecordCount', count: collectedItems.length });
      break;
    case 'saveData':
      // Listen for saveData messages from popup.js
      saveData(collectedItems);
      collectedItems=[];
      break;
    case 'sendData':
      // Listen for sendData messages from content.js
      const receivedData = request.data;
      collectedItems.push(receivedData);
      console.log('Sending updateRecordCount message to popup.js:', collectedItems.length);
      chrome.runtime.sendMessage({ action: 'updateRecordCount', count: collectedItems.length });
      break;
  }
});

function saveData(data) {
  // Add BOM for UTF-8 to ensure Excel recognizes encoding properly
  var csv = '\uFEFF';
  // Use semicolons for better Excel compatibility (especially non-US regions)
  csv += 'Time Spent;Jira Item;Entered Date\n';
  
  data.forEach(function(row) {
    // Escape CSV fields that contain semicolons or quotes
    const timeSpent = escapeCSVField(row.timeSpent);
    const jiraItem = escapeCSVField(row.jiraItem + ' ' + row.description);
    const enteredDate = escapeCSVField(row.enteredDate);
    
    csv += timeSpent + ';' + jiraItem + ';' + enteredDate + "\n";
  });
  
  console.log("CSV file is:",csv);
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const filename = 'maritime_export.csv';
  const dataURI = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

  chrome.downloads.download({
    url: dataURI,
    filename: filename,
    saveAs: true,
    conflictAction: 'uniquify',
  });
}

function escapeCSVField(field) {
  if (needsEscaping(field)) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function needsEscaping(field) {
  return field.includes(';') || field.includes('"') || field.includes('\n');
}

