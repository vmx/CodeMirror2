CodeMirror.defineMode("css", function(config) {
    var indentUnit = config.indentUnit, type;
    function ret(style, tp) {type = tp; return style;}

    function tokenBase(stream, state) {
        if (stream.match(/^(true|false)/)) {
            return ret('boolean', 'boolean');
        }
        else if (stream.match(/^null/)) {
            return ret('null', 'null');
        }

        var ch = stream.next();
        if (ch == "{") {
            return ret('object', ch);
        }
        else if (ch == "}") {
            return ret('object', ch);
        }
        else if (ch == "[") {
            return ret('array', ch);
        }
        else if (ch == "]") {
            return ret('array', ch);
        }
        else if (ch == ":") {
            return ret(null, 'value');
        }
        else if (ch == ",") {
            return ret(null, ch);
        }
        else if (ch == "0" && stream.eat(/x/i)) {
            stream.eatWhile(/[\da-f]/i);
            return ret("number", "number");
        }
        else if (/\d/.test(ch)) {
            stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
            return ret("number", "number");
        }
        else if (ch == "\"" || ch == "'") {
            // NOTE vmx 2011-10-28: It might be possible to define the
            // type and then set an additional class (next so string) in
            // the token parsing step
            var sty = 'string';
            switch(stream.peek()) {
            case '_':
                sty = 'string-couchdb';
                break;
            case '$':
                sty = 'string-couchbase';
                break;
            };
            state.tokenize = tokenString(ch);
            //return state.tokenize(stream, state);
            state.tokenize(stream, state);
            return ret(sty, 'string');
        }
        //else {
        //    stream.eatWhile(/[\w\\\-]/);
        //    return ret("variable", "variable");
        //}
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped)
          break;
        escaped = !escaped && ch == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

    return {
        startState: function(base) {
            return {
                tokenize: tokenBase,
                baseIndent: base || 0,
                stack: []
            };
        },

        token: function(stream, state) {
            if (stream.eatSpace()) return null;
            var style = state.tokenize(stream, state);

            var context = state.stack[state.stack.length-1];
            if (context == 'object' && type=='string') {
                switch(style) {
                case 'string-couchdb':
                    style = 'key-couchdb';
                    break;
                case 'string-couchbase':
                    style = 'key-couchbase';
                    break;
                default:
                    style = 'key';
                }
            }
            // End of a value in an object
            else if (context == 'value' && type == ',') {
                state.stack.pop();
            }

            if (type == 'value') {
                state.stack.push('value');
            }
            else if (type == "{") {
                state.stack.push("object");
            }
            else if (type == "}") {
                // There was a comma at the end of the value,
                // but the object is closed
                if (context !== 'value') {
                    style = 'error';
                }
                state.stack.pop();
            }
            else if (type == '[') {
                state.stack.push('array');
            }
            else if (type == ']') {
                state.stack.pop();
            }
            //else if (context == "{") state.stack.push("object");
            return style;
        },

    indent: function(state, textAfter) {
      var n = state.stack.length;
      if (/^\}/.test(textAfter))
        n -= state.stack[state.stack.length-1] == "rule" ? 2 : 1;
      return state.baseIndent + n * indentUnit;
    },

    electricChars: "}"
  };
});

CodeMirror.defineMIME("text/css", "css");
