export function truncateText(text, n = 10) {
    if (text.length <= n) return text;
    return text.slice(0, n) + '...';
  }
  
export function countDigits(num) {
  // Convert to string and get length, ignoring negative sign
  return Math.abs(num).toString().length;
}
// Utility function to count leading tabs
export function countLeadingTabs(text) {
  // console.log("countLeadingTabs "+text)
  let leadingTabs = 0;
  let index = 0;

  // Count leading tabs
  while (text[index] === '\t') {
      leadingTabs++;
      index++;
  }

  // Count occurrences of four spaces
  while (text.substr(index, 4) === '    ') {
    leadingTabs++;
    index += 4; // Move index forward by 4 spaces
  }

  return leadingTabs;
}
export function shouldDisplayRow(viewingData, index){
    // Look upward for the first parent that has open set to false
    const thisRowDepth = countLeadingTabs(viewingData[index]?.content || "");
    let leastDepth = thisRowDepth; // Initialize leastDepth with current row's depth
    let shouldBeOpenReturnValue = true; // Default to true
  
    // Look upwards 
    for (let i = index - 1; i >= 0; i--) {
      // The row above
      const upperRow = viewingData[i];
      const upperRowLeadingTabs = countLeadingTabs(upperRow?.content || "");
  
      // If the upper row has fewer tabs than the current row's depth
      if (upperRowLeadingTabs < leastDepth && upperRowLeadingTabs < thisRowDepth) {
        if (!upperRow.open) {
          shouldBeOpenReturnValue = false; // Set to false if the upper row is closed
        }
      }
  
      // Update leastDepth if we encounter a valid parent row
      if (upperRowLeadingTabs < leastDepth) {
        leastDepth = upperRowLeadingTabs; // Update leastDepth
      }
    }
    
    return shouldBeOpenReturnValue; // Return whether the current row should be displaye

  `
    a
      a
        a
        a
          a
        a
          a
          a
      a
        a
          a
  
    If a row has less tabs then this tabs
    and also less tabs then the lowest seen number of tabs so far
    and it had open: false, 
      then set the should be open to false
  
  
  `

}
export function hasNestedRows(viewingData, index) {
  // Safeguard against undefined access
  if (!viewingData || index < 0 || index >= viewingData.length) {
    return false; // Return false if input is invalid
  }

  
  let thisRowTabs = countLeadingTabs(viewingData[index]?.content || ""); // Ensure content is checked

  for (let i = index + 1; i < viewingData.length; i++) {
    let laterRow = viewingData[i];
    let laterRowLeadingTabs = countLeadingTabs(laterRow?.content || ""); // Ensure content is checked

    // If a row with more tabs is found, nested rows exist
    if (laterRowLeadingTabs > thisRowTabs) {
      return true; // There are nested rows
    }

    // If a row with equal or more tabs is found, no nested rows exist
    if (laterRowLeadingTabs >= thisRowTabs) {
      return false; // No nested rows
    }
  }

  // If no nested rows are found, return false
  return false;
}

export function arrayToText(array){
  if(!array || !Array.isArray(array)) return ""
  return array.join('\n')

  // There is not .tabs attribute 
  return array.map(item => {
    const tabs = '\t'.repeat(item.tabs); // Create tabs based on the item.tabs value
    return `${tabs}${item.content}`; // Prepend tabs to content
  }).join('\n'); // Join all lines with a newline character

}
// This takes in text from a .txt document and returns an array with the 
export function textToArray(text){
  return text.split("\n")
}
export function dateString(){
  const currentDate = new Date();

  return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate
      .getHours()
      .toString()
      .padStart(2, '0')}:${currentDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
      // `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
                
}