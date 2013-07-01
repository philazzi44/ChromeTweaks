$(
	function () {
	var oneSecond = 1000;
	var fiveSeconds = 5000;

	var fogbugzSettingsKey = 'fogbugzSettings';
	var groovesharkSettingsKey = 'groovesharkSettings';
	var focusSettingsKey = 'focusSettings';
    var jiraSettingsKey = 'jiraSettings';

	var getSettings = function (keyName, callback) {
		chrome.storage.local.get(keyName, function (response) {
			var settings = response[keyName];
			callback(settings);
		});
	};

	// Replace the change icon on Fogbugz pages.
	if (location.href.indexOf('http://p3clients.com:9090') > -1) {
		getSettings(fogbugzSettingsKey, function (settings) {
			if (!settings || !settings.enabled)
				return;

			var changeIconUrl = chrome.extension.getURL('changeicon.png');
			$('img[title="Change"]').attr('src', changeIconUrl);
		});
	}

	// If the "Are You Still There" dialog is shown, dismiss it. We check every 5 seconds, since the dialog can show up after any song.
	if (location.href.indexOf('http://grooveshark.com') > -1) {
		getSettings(groovesharkSettingsKey, function (settings) {
			if (!settings || !settings.enabled)
				return;
			var timer = window.setInterval(function () {
					var dialog = $('#lightbox-outer:visible');
					if (dialog.length > 0) {
						// We need to check what text is on the button because the same Lightbox classes are used for multiple popups. We only want to dismiss the Idle ones.
						var closeButton = dialog.find('#lightbox-footer .btn-primary');
						if (closeButton.length > 0 && (closeButton.text() == 'Resume playback' || closeButton.text() == "Yes, I'm Here!"))
							closeButton[0].click();
					}
				}, settings.interval);
		});
	}

	// If the "Use free for 100 minutes" dialog is shown, dismiss it. We check every 5 seconds, since the dialog can show up after any song.
	// Ideally, there should be a 95~ minute delay to doing the 5s polling polling because the dialog will only ever show up every 100 minutes.
	if (location.href.indexOf('https://www.focusatwill.com') > -1) {
		getSettings(groovesharkSettingsKey, function (settings) {
			if (!settings || !settings.enabled)
				return;
			var timer = window.setInterval(function () {
					var dialog = $('.modal-container.upgrade.form-modal:visible');
					if (dialog.length > 0) {
						// We need to check what text is on the button because the same dialog may be used for multiple popups. We only want to dismiss the 100 minutes one.
						var continueButton = dialog.find('.continue-button');
						if (continueButton.length > 0 && (continueButton.text() == 'Use free for 100 minutes')) {
							// After simulating a click on the button, we'll also simulate a click on the 'play' button to start the music again.
							continueButton[0].click();
							setTimeout(function () {
								var playButton = $('#home-header').find('.playerControls').find('.play')
									if (playButton.length > 0)
										playButton[0].click();
							}, oneSecond);
						}
					}
				}, settings.interval);
		});
	}

	// Move the Tempo Bar so it is always visible when using the Detail View.
	// Add a Copy button for the issue numbers.
	var lastUrl;
	var tryDoJiraChanges = function (settings) {
		// Prevent the changes if the Url hasn't changed at all.
		if (lastUrl === window.location.href)
			return;
		lastUrl = window.location.href;

        if (settings.tempoBarEnabled)
        {
            // If the Split View is being used, then move the Tempo Bar to where it is visible.
            var splitView = $('div.split-view');
            var isSplitViewInUse = (splitView.length > 0);
            if (isSplitViewInUse) {
                var tempoBar = $('#tempo-bar');
                // If we've already moved the Tempo Bar, then do nothing.
                if (tempoBar.attr('data-tempo-move-done') !== 'true') {
                    var page = $('#page');
                    if (page.length > 0 && tempoBar.length > 0) {
                        tempoBar.attr('data-tempo-move-done', 'true');
                        tempoBar.css('left', 'initial').css('right', '17px').css('width', '60%').css('font-size', '10px');
                        page.append(tempoBar);
                    }
                }
            }
        }
        
        if (settings.copyButtonEnabled)
        {
            // All Issue Links can have a Copy button for the item name beside them.
            var issueLink = $('.issue-link,.splitview-issue-link.issue-link-key');
            issueLink.each(function (i, e) {
                // If we've already processed this link, then do nothing.
                if ($(this).attr('data-copy-img-done') === 'true')
                    return;
                $(this).attr('data-copy-img-done', 'true');

                // Only add a copy image to the text representation of the issue key.
                var issueKey = $.trim($(this).attr('data-issue-key'));
                var issueUrl = this.href;
                if (issueKey.length > 0 && $.trim($(this).text()) === issueKey) {
                    var copyIcon = chrome.extension.getURL('copyicon.png');
                    var copyImg = $('<img src="' + copyIcon + '" data-suppress="false" width="16px" height="16px">');
                    copyImg.css('cursor', 'pointer');
                    copyImg.css('vertical-align', 'middle');
                    copyImg.css('margin-left', '5px');
                    copyImg.click(function (e) {
                        e.preventDefault();
                    });
                    copyImg.mousedown(function (e) {
                        var leftClick = 1;
                        var middleClick = 2;

                        // If not left or middle click, so do nothing.
                        if (e.which !== leftClick && e.which !== middleClick)
                            return;

                        var isCopyUrl = (e.which === 2);
                        e.preventDefault();

                        if (copyImg.attr('data-suppress') === 'true')
                            return;

                        var copyData = issueKey;
                        if (e.which === middleClick)
                            copyData = issueUrl;

                        chrome.extension.sendMessage({
                            name : 'copy',
                            data : copyData
                        }, function (response) {
                            if (response != undefined && response.copySuccess === 'true') {
                                // Suppress future clicks for now.
                                copyImg.attr('data-suppress', 'true');

                                // Fade out the image...
                                copyImg.fadeOut(100, function () {
                                    // Fade in the new Ok icon.
                                    if (isCopyUrl)
                                        copyImg.attr('src', chrome.extension.getURL('copyurldoneicon.png'));
                                    else
                                        copyImg.attr('src', chrome.extension.getURL('copydoneicon.png'));
                                    copyImg.css('cursor', 'auto');
                                    copyImg.fadeIn(150);

                                    // After 1000ms, fade out the Ok icon and fade in the Copy icon, re-enabling clicks.
                                    setTimeout(function () {
                                        copyImg.fadeOut(100, function () {
                                            copyImg.attr('src', chrome.extension.getURL('copyicon.png'));
                                            copyImg.css('cursor', 'pointer');
                                            copyImg.fadeIn(150);
                                            copyImg.attr('data-suppress', 'false');
                                        });
                                    }, 1500);

                                });
                            }
                            return true;
                        });
                    });

                    $(this).after(copyImg);
                }
            });
        }
	};
    
	// Event to fire the method whenever the Url of the page changes (since Jira uses a lot of async postbacks.)
	if (location.href.indexOf('http://jira.p3clients.com:8100/') > -1) {
		getSettings(jiraSettingsKey, function (settings) {
			if (!settings || (!settings.tempoBarEnabled && !settings.copyButtonEnabled))
				return;
			tryDoJiraChanges(settings);

			// Every 1 seconds, we'll attempt to re-do the Jira changes.
			// Note that tryDoJiraChanges does nothing if the Url hasn't changed.
			setInterval(function () {
				tryDoJiraChanges(settings);
			}, 1000);
		});
		}
});