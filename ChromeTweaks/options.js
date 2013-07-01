$(
	function () {

	var fogbugz = new Object();
	fogbugz.enabledCheckbox = $('#chkFogbugz');
	fogbugz.settingsKey = 'fogbugzSettings';

	var grooveshark = new Object();
	grooveshark.defaultInterval = 5;
	grooveshark.enabledCheckbox = $('#chkGrooveshark');
	grooveshark.intervalDiv = $('#divGroovesharkInterval');
	grooveshark.intervalInput = $('#nmbGroovesharkInterval');
	grooveshark.settingsKey = 'groovesharkSettings';

	var focus = new Object();
	focus.defaultInterval = 5;
	focus.enabledCheckbox = $('#chkFocus');
	focus.intervalDiv = $('#divFocusInterval');
	focus.intervalInput = $('#nmbFocusInterval');
	focus.settingsKey = 'focusSettings';
    
	var jira = new Object();
	jira.defaultInterval = 5;
	jira.tempoBarEnabledCheckbox = $('#chkJiraTempoBar');
    jira.copyButtonEnabledCheckbox = $('#chkJiraCopyButton');
	jira.settingsKey = 'jiraSettings';

	var getSettings = function (keyName, callback) {
		chrome.storage.local.get(keyName, function (response) {
			var settings = response[keyName];
			callback(settings);
		});
	};

	var setSettings = function (keyName, settings) {
		var settingsWrapper = {};
		settingsWrapper[keyName] = settings;
		chrome.storage.local.set(settingsWrapper);
	};

	var saveFogbugz = function () {
		var settings = new Object();
		settings.enabled = fogbugz.enabledCheckbox[0].checked;
		setSettings(fogbugz.settingsKey, settings);
	};

	var loadFogbugz = function () {
		getSettings(fogbugz.settingsKey, function (settings) {
			if (!settings) {
				fogbugz.enabledCheckbox.prop('checked', true)
			} else {
				fogbugz.enabledCheckbox.prop('checked', (settings.enabled));
			}
		});
	};

	var saveGrooveshark = function () {
		var settings = new Object();
		if (grooveshark.enabledCheckbox[0].checked) {
			settings.enabled = true;
			var interval = Number(grooveshark.intervalInput.val());
			if (interval > 0 && interval <= 60)
				settings.interval = interval.toString();
			else
				settings.interval = '';
		} else {
			settings.enabled = false;
			settings.interval = '';
		}
		setSettings(grooveshark.settingsKey, settings);
	};

	var loadGrooveshark = function () {
		getSettings(grooveshark.settingsKey, function (settings) {
			if (!settings) {
				grooveshark.enabledCheckbox.prop('checked', true)
				grooveshark.intervalInput.val(grooveshark.defaultInterval);
				grooveshark.intervalDiv.show();
			} else {
				grooveshark.enabledCheckbox.prop('checked', (settings.enabled));
				if (settings.enabled) {
					grooveshark.intervalDiv.show();
					if (Number(settings.interval) > 0 && Number(settings.interval) <= 60)
						grooveshark.intervalInput.val(settings.interval);
					else
						grooveshark.intervalInput.val(grooveshark.defaultInterval);
				} else {
					grooveshark.intervalDiv.hide();
				}
			}
		});
	};

	var saveFocus = function () {
		var settings = new Object();
		if (focus.enabledCheckbox[0].checked) {
			settings.enabled = true;
			var interval = Number(focus.intervalInput.val());
			if (interval > 0 && interval <= 60)
				settings.interval = interval.toString();
			else
				settings.interval = '';
		} else {
			settings.enabled = false;
			settings.interval = '';
		}
		setSettings(focus.settingsKey, settings);
	};

	var loadFocus = function () {
		getSettings(focus.settingsKey, function (settings) {
			if (!settings) {
				focus.enabledCheckbox.prop('checked', true)
				focus.intervalInput.val(focus.defaultInterval);
				focus.intervalDiv.show();
			} else {
				focus.enabledCheckbox.prop('checked', (settings.enabled));
				if (settings.enabled) {
					focus.intervalDiv.show();
					if (Number(settings.interval) > 0 && Number(settings.interval) <= 60)
						focus.intervalInput.val(settings.interval);
					else
						focus.intervalInput.val(focus.defaultInterval);
				} else {
					focus.intervalDiv.hide();
				}
			}
		});
	};

	var saveJira = function () {
		var settings = new Object();
		settings.tempoBarEnabled = jira.tempoBarEnabledCheckbox[0].checked;
        settings.copyButtonEnabled = jira.copyButtonEnabledCheckbox[0].checked;
		setSettings(jira.settingsKey, settings);
	};

	var loadJira = function () {
		getSettings(jira.settingsKey, function (settings) {
			if (!settings) {
				jira.tempoBarEnabledCheckbox.prop('checked', true)
                jira.copyButtonEnabledCheckbox.prop('checked', true)
			} else {
				jira.tempoBarEnabledCheckbox.prop('checked', (settings.tempoBarEnabled));
                jira.copyButtonEnabledCheckbox.prop('checked', (settings.copyButtonEnabled));
			}
		});
	};

	// Fogbugz Settings
	fogbugz.enabledCheckbox.change(function () {
		saveFogbugz();
	});

	// Grooveshark settings
	grooveshark.enabledCheckbox.change(function () {
		if (this.checked)
			grooveshark.intervalDiv.show('drop');
		else
			grooveshark.intervalDiv.hide('drop');
		saveGrooveshark();
	});
	grooveshark.intervalInput.change(function () {
		saveGrooveshark();
	});
	grooveshark.intervalInput[0].oninput = function () {
		saveGrooveshark();
	};

	// Focus At Will settings
	focus.enabledCheckbox.change(function () {
		if (this.checked)
			focus.intervalDiv.show('drop');
		else
			focus.intervalDiv.hide('drop');
		saveFocus();
	});
	focus.intervalInput.change(function () {
		saveFocus();
	});
	focus.intervalInput[0].oninput = function () {
		saveFocus();
	};

    // Jira settings
    jira.tempoBarEnabledCheckbox.change(function () {
        saveJira();
    });
    jira.copyButtonEnabledCheckbox.change(function () {
        saveJira();
    });
    
	// JQuery UI Setup

	// Startup
	if (chrome.extension !== undefined) {
		$('#changeIcon').attr('src', chrome.extension.getURL('changeicon.png'));
        $('#bugIcon').attr('src', chrome.extension.getURL('bugicon.gif'));

		loadFogbugz();
		loadGrooveshark();
		loadFocus();
		loadJira();
	}
});
