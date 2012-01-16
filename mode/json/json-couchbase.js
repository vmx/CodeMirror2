// Prevents editing of lines that are marked as readonly
function preventEditing(cm, evt) {
    if (evt.type=='keydown' || evt.type=='keypress') {
        //console.log(evt);
        var pos = cm.getCursor(true);
        var lineInfo = cm.lineInfo(pos.line);
        console.log(evt.keyCode);
        if (lineInfo.lineClass == 'readonly' &&
                // Stop events only for key codes that are not for meta keys
                // or moving the cursor
                (evt.keyCode < 34 || evt.keyCode > 44)) {
            evt.stop();
            return true;
        }
    }
}


// Adds a class to lines that contain a reserved key (starting with "_" or "$")
// This is a onHighlightComplete handler.
function readonlyCouchbase(cm) {
    CodeMirror.runMode(cm.getValue(), cm.getOption('mode'),
    function(text, style, line, ch) {
        if (style == 'key-couchdb' || style == 'key-couchbase') {
            cm.setLineClass(line, 'readonly');
        }
    });
}
