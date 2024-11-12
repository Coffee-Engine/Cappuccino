(function () {
  window.cappucino = {};

  //Replacement opcodes for the transpiler.
  cappucino.opcodes = {
    //loops
    repeat: (code, index) => {
      const inner = cappucino.codeRunner(code, index, 'until');
      const conditional = cappucino.codeRunner(
        code,
        cappucino.codeRunnerPosition,
        null,
        "\n"
      );

      return `while (!${conditional[0].replaceAll('\n', '')}) {${inner[0]}}\n`;
    },
    while: (code, index) => {
      const conditional = cappucino.codeRunner(code, index, 'do');
      const inner = cappucino.codeRunner(
        code,
        cappucino.codeRunnerPosition,
        'end'
      );

      return `while (${conditional[0].replaceAll('\n', '')}) {${inner[0]}}\n`;
    },
    for: (code,index) => {
      let text = `for (let `;
      const variableName = cappucino.codeRunner(code, index, false, "=", "", true);
      const initialValue = cappucino.codeRunner(code, cappucino.codeRunnerPosition, false, ",", true);
      const length = cappucino.codeRunner(code, cappucino.codeRunnerPosition, false, ",", true);
      text += `${variableName[1]} = ${initialValue[1]}; ${length} `;
      return `${variableName[1]}++) {\nconst item = defaultArray[${variableName[1]}];\n}`
    },

    //Functions
    function: (code, index, char, wrap) => {
      const conditional = cappucino.codeRunner(code, index, null, "\n");
      const inner = cappucino.codeRunner(
        code,
        cappucino.codeRunnerPosition,
        'end'
      );

      return `${wrap == "class" ? ""  : "function"} ${conditional[0].replaceAll('\n', '')} {${inner[0]}}\n`;
    },

    class: (code, index, char, wrap) => {
      const name = cappucino.codeRunner(code, index, ["from", "constructed"], "\n");
      let text = `class ${name[0]}`;
      let parentClass;
      if (name[1] == "from") {
        parentClass = cappucino.codeRunner(code, cappucino.codeRunnerPosition, ["constructed", "contains"], "\n");
        text += ` extends ${parentClass[0]} {\n`;
      }
      //If we skip straight to containment we contain our object
      if (parentClass[1] == "constructed") {
        const constructorArgs = cappucino.codeRunner(code, cappucino.codeRunnerPosition, ["contains"], ")", wrap, true);
        //Skip the )
        cappucino.codeRunnerPosition += 1;
        const constructor = cappucino.codeRunner(code, cappucino.codeRunnerPosition, ["contains"], false);
        text += `constructor ${constructorArgs[0].length > 1 ? constructorArgs[0] : "()"} {${constructor[0]}\n}\n`;
      }
      else {
        text += `${(parentClass) ? "constructor() \n{\nsuper()\n}\n" : "constructor() {}"}`;
      }

      const inner = cappucino.codeRunner(
        code,
        cappucino.codeRunnerPosition,
        'end',
        false,
        "class"
      );

      text += inner[0];

      return `${text}}\n`;
    },

    //Statements
    if: (code, index) => {
      const conditional = cappucino.codeRunner(code, index, 'then');
      const inner = cappucino.codeRunner(code, cappucino.codeRunnerPosition, [
        'end',
        'else',
        'elseif',
      ]);
      let post = '';
      if (inner[1] == 'elseif')
        post = cappucino.opcodes.elseif(code, cappucino.codeRunnerPosition);
      if (inner[1] == 'else')
        post = cappucino.opcodes.else(code, cappucino.codeRunnerPosition);

      return `if (${conditional[0].replaceAll('\n', '')}) {${
        inner[0]
      }}\n${post}`;
    },
    else: (code, index) => {
      const inner = cappucino.codeRunner(code, cappucino.codeRunnerPosition, [
        'end',
        'elseif',
      ]);

      return `else {${inner[0]}}\n`;
    },
    elseif: (code, index) => {
      const conditional = cappucino.codeRunner(code, index, 'then');
      const inner = cappucino.codeRunner(code, cappucino.codeRunnerPosition, [
        'end',
        'else',
        'elseif',
      ]);
      let post = '';
      if (inner[1] == 'elseif')
        post = cappucino.opcodes.elseif(code, cappucino.codeRunnerPosition);
      if (inner[1] == 'else')
        post = cappucino.opcodes.else(code, cappucino.codeRunnerPosition);

      return `else if (${conditional[0].replaceAll('\n', '')}) {${
        inner[0]
      }}\n${post}`;
    },

    print:(code, index, char) => {
      return `console.log${char}`;
    },

    //Conditions
    and: (code, index, char) => {
      return `&&${char}`;
    },
    or: (code, index, char) => {
      return `||${char}`;
    },
    not: (code, index, char) => {
      return `!${char}`;
    },
  };

  cappucino.whitespaces = [' ', '\n', '\t', '(', ')', ",", "="];

  cappucino.codeRunnerPosition = 0;

  //Runs through our code and compiles it to js
  cappucino.codeRunner = (code, index, untilWord, untilNewline, wrapperIdentifier, prepend) => {
    let string = '';
    let word = '';

    for (
      cappucino.codeRunnerPosition = index;
      cappucino.codeRunnerPosition < code.length;
      cappucino.codeRunnerPosition++
    ) {
      const char = code.charAt(cappucino.codeRunnerPosition);
      if (cappucino.whitespaces.includes(char) || char === untilNewline) {
        //If we reach our until word(s) stop
        if (Array.isArray(untilWord)) {
          if (untilWord.includes(word)) return [string, word];
        } else {
          if (word === untilWord) return [string, word];
        }

        //If we stop at a newline then we do
        if (char === untilNewline) {
          if (prepend) {
            string += word;
            string += char;
          }
          else {
            string += char;
            string += word;
          }
          return [string, word];
        }

        //check for opcodes
        if (cappucino.opcodes[word]) {
          //cappucino.codeRunnerPosition++;
          string += cappucino.opcodes[word](code, cappucino.codeRunnerPosition,char,wrapperIdentifier);
        } else {
          string += word;
          string += char;
        }
        word = '';
      } else {
        word += char;
      }
    }

    return [string, word];
  };

  cappucino.compile = code => {
    return cappucino.codeRunner(code, 0, ' ')[0];
  };
})();
