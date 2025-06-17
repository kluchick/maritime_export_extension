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
      const gapFillOptions = request.gapFillOptions || { fillGaps: false, defaultTask: '' };
      saveData(collectedItems, gapFillOptions);
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

function saveData(data, gapFillOptions = { fillGaps: false, defaultTask: '' }) {
  let processedData = [...data];
  
  // If gap filling is enabled, analyze and fill gaps
  if (gapFillOptions.fillGaps && gapFillOptions.defaultTask) {
    processedData = fillHourGaps(data, gapFillOptions.defaultTask);
  }
  
  // Add BOM for UTF-8 to ensure Excel recognizes encoding properly
  var csv = '\uFEFF';
  // Use semicolons for better Excel compatibility (especially non-US regions)
  csv += 'Time Spent;Jira Item;Entered Date\n';
  
  processedData.forEach(function(row) {
    // Format time spent to 2 decimal places with comma as decimal delimiter
    const timeValue = parseFloat(row.timeSpent.replace(',', '.')) || 0;
    const formattedTime = timeValue.toFixed(2).replace('.', ',');
    
    // Escape CSV fields that contain semicolons or quotes
    const timeSpent = escapeCSVField(formattedTime);
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

function fillHourGaps(data, defaultTask) {
  // Group data by date
  const dataByDate = {};
  
  data.forEach(item => {
    const date = item.enteredDate;
    if (!dataByDate[date]) {
      dataByDate[date] = [];
    }
    dataByDate[date].push(item);
  });
  
  const processedData = [];
  
  // Sort dates to maintain chronological order
  const sortedDates = Object.keys(dataByDate).sort();
  
  // Process each date and add gap filling records immediately after real records
  sortedDates.forEach(date => {
    const dayItems = dataByDate[date];
    let totalHours = 0;
    
    // Add all real records for this date first
    dayItems.forEach(item => {
      processedData.push(item);
      const timeValue = parseFloat(item.timeSpent.replace(',', '.')) || 0;
      totalHours += timeValue;
    });
    
    // If less than 8 hours, add gap filling record right after this date's records
    if (totalHours < 8) {
      const gapHours = (8 - totalHours).toFixed(2);
      const gapRecord = {
        timeSpent: gapHours,
        jiraItem: defaultTask,
        description: '',
        enteredDate: date
      };
      processedData.push(gapRecord);
    }
  });
  
  return processedData;
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

