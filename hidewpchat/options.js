document.addEventListener('DOMContentLoaded', function () {
    // Load saved options when the options page is opened
    chrome.storage.local.get(['dynamicBlurLevel', 'isDefaultBlur'], function (data) {
        document.getElementById('blurLevel').value = data.dynamicBlurLevel || 5;
        document.getElementById('defaultBlur').checked = data.isDefaultBlur || false;
    });

    // Save options when the "Save Options" button is clicked
    document.getElementById('saveOptions').addEventListener('click', function () {
        const blurLevel = parseInt(document.getElementById('blurLevel').value, 10);
        const defaultBlur = document.getElementById('defaultBlur').checked;

        // Save options to chrome.storage.local
        chrome.storage.local.set({
            dynamicBlurLevel: blurLevel,
            isDefaultBlur: defaultBlur,
        }, function () {
            // Notify the user that options have been saved
            alert('Options saved!');
        });
    });
});
