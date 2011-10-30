// The actual error markers (needed to be able to remove them)
CodeMirror.jsonModeMarkers = [];
function parseJsonErrors(cm) {
    // keysList is an array of arrays, which contains the keys of the current
    // level
    var keysList = [];
    // Contains all errors that should be inserted
    var errors = [];
    var i = 0;
    CodeMirror.runMode(cm.getValue(), cm.getOption('mode'),
    function(text, style, pos) {
        // Get all keys
        if (style == 'object') {
            if (text == '{') {
                keysList.push([]);
            }
            else if (text == '}') {
                keysList.pop();
            }
        }
        if (style == 'key') {
            if (keysList[keysList.length-1][text]===undefined) {
                // Set the value to the current position of the token.
                // If there was a second one, the value will be set to "true"
                keysList[keysList.length-1][text] = {
                    line: pos.line, from: pos.ch, to: pos.ch+text.length};
            }
            // Key with same value already exists
            else {
                // It's the first occurrence of a duplicate key
                if (keysList[keysList.length-1][text]!==true) {
                    errors.push(keysList[keysList.length-1][text]);
                    keysList[keysList.length-1][text] = true;
                }
                errors.push({
                    line: pos.line, from: pos.ch, to: pos.ch+text.length});
            }
        }
    });
    //console.log(errors);
    // Remove old markers
    while(CodeMirror.jsonModeMarkers.length!==0) {
        var marker = CodeMirror.jsonModeMarkers.pop();
        marker();
    }
    // Add the actual errors
    for (i in errors) {
        CodeMirror.jsonModeMarkers.push(cm.markText(
            {line: errors[i].line, ch: errors[i].from},
            {line: errors[i].line, ch: errors[i].to},
            'cm-error-duplicate'));
    }
    console.log(CodeMirror.jsonModeMarkers);
}
