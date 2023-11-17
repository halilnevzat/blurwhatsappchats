document.getElementById('blurButton').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBlur' });
  });
});

document.getElementById('blurCheckbox').addEventListener('change', function () {
  const isDefaultBlur = this.checked;
  chrome.storage.local.set({ isDefaultBlur }, function () {
    // Trigger toggleBlur after setting the default blur
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBlur' });
    });
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get("isActive", (data) => {
    const isActive = !data.isActive;
    chrome.storage.local.set({ isActive });
    chrome.action.setBadgeBackgroundColor({ color: isActive ? '#777' : '#0097ff' });
    chrome.action.setBadgeText({
      text: isActive ? 'OFF' : 'ON'
    });

    // Trigger toggleBlur when activating the extension
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBlur' });
    });

    if (!isActive) {
      // If the extension is activated, set the default blur based on the checkbox
      chrome.storage.local.get("isDefaultBlur", (data) => {
        const isDefaultBlur = data.isDefaultBlur;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'setDefaultBlur', isDefaultBlur });
        });
      });
    }
  });
});
