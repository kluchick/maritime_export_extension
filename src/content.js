console.log("Start of content.js - 2");

function parseMaritimePage() {
  const daysDivs = document.querySelectorAll(".swim_lane");
  daysDivs.forEach((dayDiv) => {
    const entryDivs = dayDiv.querySelectorAll(".timecard_card");

    entryDivs.forEach((entryDiv) => {
      //find the date
        const dateElement = dayDiv.querySelector("h4");
        const date = parseDateString(dateElement.textContent.trim());
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
          enteredDate: date
        };

        // Send the data object as a message to background.js
        chrome.runtime.sendMessage({ action: 'sendData', data: data });
        console.log('Message Message sent to background.js', data);
      } else {
          console.log("Could not find one or more required elements within the entryDiv.");
      }
    });
  });

}

function parseDateString(dateString) {
  // Split the input string by spaces to separate "Tuesday" and "10/03"
  dateString = dateString.replace('/', ' ');
  const parts = dateString.split(' ');
  console.log('input date string:', dateString);

  // Get the day and month from the parts array
  const monthNumber = parts[1].trim();
  console.log('monthNumber:', monthNumber);
  const dayOfMonth = parts[2].trim();
  console.log('dayOfMonth:', dayOfMonth);

  // Assuming the current year and a time of midnight (00:00:00)
  const year = new Date().getFullYear();

  const date = year + '-' + monthNumber + '-' + dayOfMonth;
  return date;
}


