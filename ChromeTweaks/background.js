// Listen for Copy requests.
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.name === 'copy') {
        try
        {
            var copyArea = document.getElementById("philTweaksCopyArea");
            copyArea.value = request.data;
            copyArea.select();
            document.execCommand('copy');
            copyArea.value = '';
            sendResponse({ copySuccess: 'true' });
        }
        catch (err)
        {
            sendResponse({ copySuccess: 'false' });
            alert('Failed to copy, extension must be broken :( - ' + err);
        }
    }
    return true;
});