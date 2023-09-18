//console.log("Start of content.js - 2");

function parseMaritimePage() {
 // Add an event listener for when the popup is opened
     const entryDivs = document.querySelectorAll(".timecard_card");
     const collectButton = document.getElementById('collectData');
     
     entryDivs.forEach((entryDiv) => {
         // Find elements within the entryDiv to extract data
         const jiraElement = entryDiv.querySelector("a");
         const timeElements = entryDiv.querySelectorAll("div.bold_text");
         var timeElement;
         if (timeElements.length >= 2) {
           timeElement = timeElements[1];
         } else {
           console.log('No second .bold_text element found.');
         }
         const descriptionElement = entryDiv.querySelector(".little_margin p");
         const enteredTime = entryDiv.querySelector(".little_margin .flex_across div:nth-of-type(1)");

         if (jiraElement && timeElement && descriptionElement && enteredTime) {
            // Create an object to hold the variables
            const data = {
              jiraItem: jiraElement.textContent.trim(),
              timeSpent: timeElement.textContent.trim().replace('h', '').replace('.', ','),
              description: descriptionElement.textContent.trim(),
              enteredDate: enteredTime.textContent.trim().replace('Entered:', '').trim()
            };

            // Send the data object as a message to background.js
            chrome.runtime.sendMessage({ action: 'sendData', data: data });
            console.log('Message Message sent to background.js', data);
         } else {
             console.log("Could not find one or more required elements within the entryDiv.");
         }
     });
}


