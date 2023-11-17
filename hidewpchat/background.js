chrome.runtime.onInstalled.addListener(function () {
  console.log('WhatsApp Blur Extension Installed');
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggleBlur') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBlur' });
    });
  }
});
