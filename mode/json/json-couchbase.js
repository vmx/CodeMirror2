// Prevents editing of keys starting with "_" or "$"
function preventEditing(cm, evt) {
    if (evt.type=='keydown' || evt.type=='keydown') {
        //console.log(evt);
        var token = cm.getTokenAt(cm.getCursor(true));
        if (token.className === 'key-couchdb' ||
                token.className == 'key-couchbase' ) {
            console.log(evt, token);
            evt.stop();
            return true;
        }
    }
}
