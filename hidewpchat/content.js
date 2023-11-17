console.log('Content Script Loaded');

let dynamicBlurLevel = 5; // Default blur level
let isVisible = true; // Flag to track tab visibility
let isDefaultBlur = false; // Flag to track if default blur is enabled

// Function to retrieve dynamic blur level and default blur option from storage
function getExtensionOptions() {
    chrome.storage.local.get(['dynamicBlurLevel', 'isDefaultBlur'], function (data) {
        if (data.dynamicBlurLevel) {
            dynamicBlurLevel = data.dynamicBlurLevel;
            console.log('Dynamic Blur Level from Storage:', dynamicBlurLevel);
            refreshStyle(); // Apply the dynamic blur level on page load
            getChatTitles(); // Start getting chat titles
        }

        if (data.isDefaultBlur !== undefined) {
            isDefaultBlur = data.isDefaultBlur;
            console.log('Default Blur Option from Storage:', isDefaultBlur);

            // Only apply blur if the default option is set to blur
            if (isDefaultBlur) {
                getChatTitles(); // Start getting chat titles when default blur is enabled
            }
        }
    });
}

// Call the function to retrieve dynamic blur level and default blur option on page load
getExtensionOptions();

// Event listener for tab visibility change
document.addEventListener('visibilitychange', function () {
    isVisible = document.visibilityState === 'visible';
    if (isVisible && isDefaultBlur) {
        console.log('Tab is visible and default blur is enabled. Triggering toggleBlur...');
        getChatTitles(); // Start getting chat titles when tab becomes visible and default blur is enabled
    }
});

function getChatTitles() {
  if (!isDefaultBlur) {
      console.log('Default blur is not enabled. Skipping chat titles retrieval.');
      return;
  }

  const chatItems = document.querySelectorAll('[role="listitem"]');
  var chatTitles = [];

  chatItems.forEach(chatItem => {
      const titleElement = chatItem.querySelector('[title]');
      if (titleElement) {
          const title = titleElement.getAttribute('title');
          chatTitles.push(title);
      }
  });

  // If chatTitles array is still empty, retry after a short delay
  if (chatTitles.length === 0) {
      console.log('Chat Titles Array is empty. Retrying...');
      setTimeout(getChatTitles, 1000); // Retry after 1 second
  } else {
      console.log('Chat Titles Array:', chatTitles);
      blurUnblurChats(chatTitles);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'toggleBlur' && isVisible) {
        console.log('Toggling Blur');
        getChatTitles(); // Start getting chat titles when toggleBlur is triggered
    } else if (request.action === 'setDefaultBlur') {
        console.log('Setting Default Blur:', request.isDefaultBlur);
        isDefaultBlur = request.isDefaultBlur;

        // Only apply blur if the default option is set to blur
        if (isDefaultBlur && isVisible) {
            getChatTitles(); // Start getting chat titles when default blur is enabled
        }
    } else if (request.action === 'updateDynamicBlurLevel') {
        dynamicBlurLevel = request.dynamicBlurLevel;
        console.log('Updating Dynamic Blur Level:', dynamicBlurLevel);
        refreshStyle();
    }
});

function blurUnblurChats(chatTitles = null) {
    const chatItems = document.querySelectorAll('[role="listitem"]');

    if (!chatTitles) {
        chatTitles = [];
        chatItems.forEach(chatItem => {
            const titleElement = chatItem.querySelector('[title]');
            if (titleElement) {
                const title = titleElement.getAttribute('title');
                chatTitles.push(title);
            }
        });
    }

    // Now chatTitles array contains the titles of all chat items
    console.log('Chat Titles Array:', chatTitles);

    chatItems.forEach(chatItem => {
        toggleBlur(chatItem, chatTitles); // Apply blur immediately
        chatItem.addEventListener('click', () => toggleBlur(chatItem, chatTitles));
    });

    function toggleBlur(clickedChatItem, allChatTitles) {
        
        const titleElement = clickedChatItem.querySelector('[title]');
        if (titleElement) {
            const title = titleElement.getAttribute('title');

            // Remove blur from the clicked chat item
            clickedChatItem.classList.remove('blurred');

            // Blur other chat items in the array
            chatItems.forEach(chatItem => {
                const titleElement = chatItem.querySelector('[title]');
                if (titleElement) {
                    const chatTitle = titleElement.getAttribute('title');
                    if (allChatTitles.includes(chatTitle) && chatItem !== clickedChatItem) {
                        chatItem.classList.add('blurred');
                    }
                }
            });

            // Refresh the content script style by removing and injecting a new style element
            refreshStyle();
        }
    }

    
}

function refreshStyle() {
  const existingStyleElement = document.querySelector('#blurStyle');
  if (existingStyleElement) {
      existingStyleElement.remove();
  }

  // Inject a new style element to apply the .blurred class with dynamic blur level
  const styleElement = document.createElement('style');
  styleElement.id = 'blurStyle';
  styleElement.textContent = `.blurred { filter: blur(${dynamicBlurLevel}px); }`; // Use dynamicBlurLevel variable
  document.head.appendChild(styleElement);
}

function setDefaultBlur(isDefaultBlur) {
    console.log('Setting Default Blur:', isDefaultBlur);
    isDefaultBlur = isDefaultBlur;

    // Only apply blur if the default option is set to blur and the tab is visible
    if (isDefaultBlur && isVisible) {
        getChatTitles(); // Start getting chat titles when default blur is enabled
    }
}
