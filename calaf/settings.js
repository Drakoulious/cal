"use strict";

var defaultSettings = {
    indExpBetwIfThenByFirstTokenAfterIf: 'true',
    demoCodeOnStartup: 'true'
}

function loadSettings() {
    let settings = {};
    for (let key in defaultSettings) {
        let defaultOpt = defaultSettings[key];
        let userOpt = localStorage.getItem(key);
        if (userOpt === null) {
            localStorage.setItem(key, defaultOpt);
            userOpt = defaultOpt;
        }        
        settings[key] = userOpt;
    }
    return settings;
}

function initSettingsUI(settings) {
    for (let key in settings) {
        let opt = settings[key];        
        let checked = opt === "true" ? true : false;
        document.getElementById(key).checked = checked;
    }
}

function setOption(cb) {
    localStorage.setItem(cb.id, cb.checked);
}
