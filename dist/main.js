(function () {
  window.cappuccino = {};

  //Replacement opcodes for the transpiler.
  cappuccino.opcodes = {
    //loops
    repeat: (code, index) => {
      const inner = cappuccino.codeRunner(code, index, 'until');
      const conditional = cappuccino.codeRunner(
        code,
        cappuccino.codeRunnerPosition,
        null,
        "\n"
      );

      return `while (!(${conditional[0].replaceAll('\n', '')})) {${inner[0]}}\n`;
    },
    while: (code, index) => {
      const conditional = cappuccino.codeRunner(code, index, 'do');
      const inner = cappuccino.codeRunner(
        code,
        cappuccino.codeRunnerPosition,
        'end'
      );

      return `while (${conditional[0].replaceAll('\n', '')}) {${inner[0]}}\n`;
    },
    for: (code,index) => {
      let text = `for (let `;
      const variableName = cappuccino.codeRunner(code, index, false, "=");
      const initialValue = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, "do", false);
      
      //Remove trailing = if needed
      if (initialValue[0].charAt(0) == '=') initialValue[0] = initialValue[0].replace('=', '');
      const split = initialValue[0].split(",");

      switch (split.length) {
        case 1:
          console.error(`Error while parsing Cappuchino code, For loop incomplete at character ${index}.`);
          break;

        case 2:
          text += `${variableName[1]} = ${split[0]}; ${variableName[1]} > ${split[1]}; ${variableName[1]}++`;
          break;

        case 3:
          text += `${variableName[1]} = ${split[0]}; ${variableName[1]} > ${split[1]}; ${variableName[1]}+=${split[2]}`;
          break;
      
        default:
          console.error(`Error while parsing Cappuchino code, For loop invalid at character ${index}.`);
          break;
      }

      const inner = cappuccino.codeRunner(
        code,
        cappuccino.codeRunnerPosition,
        'end'
      );

      text += `) {${inner[0]}}`;
      return text;
    },

    //Functions
    function: (code, index, char, wrap) => {
      const conditional = cappuccino.codeRunner(code, index, null, "\n");
      const inner = cappuccino.codeRunner(
        code,
        cappuccino.codeRunnerPosition,
        'end'
      );

      return `${wrap == "class" ? ""  : "function"} ${conditional[0].replaceAll('\n', '')} {${inner[0]}}\n`;
    },

    class: (code, index, char, wrap) => {
      const name = cappuccino.codeRunner(code, index, ["from", "constructed"], "\n");
      let text = `class ${name[0]}`;
      let parentClass;
      if (name[1] == "from") {
        parentClass = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, ["constructed", "contains"], "\n");
        text += ` extends ${parentClass[0]} {\n`;
      }
      //If we skip straight to containment we contain our object
      if (parentClass[1] == "constructed") {
        const constructorArgs = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, ["contains"], ")", wrap, true);
        //Skip the )
        cappuccino.codeRunnerPosition += 1;
        const constructor = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, ["contains"], false);
        text += `constructor ${constructorArgs[0].length > 1 ? constructorArgs[0] : "()"} {${constructor[0]}\n}\n`;
      }
      else {
        text += `${(parentClass) ? "constructor() \n{\nsuper()\n}\n" : "constructor() {}"}`;
      }

      const inner = cappuccino.codeRunner(
        code,
        cappuccino.codeRunnerPosition,
        'end',
        false,
        "class"
      );

      text += inner[0];

      return `${text}}\n`;
    },

    //Statements
    if: (code, index) => {
      const conditional = cappuccino.codeRunner(code, index, 'then');
      const inner = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, [
        'end',
        'else',
        'elseif',
      ]);
      let post = '';
      if (inner[1] == 'elseif')
        post = cappuccino.opcodes.elseif(code, cappuccino.codeRunnerPosition);
      if (inner[1] == 'else')
        post = cappuccino.opcodes.else(code, cappuccino.codeRunnerPosition);

      return `if (${conditional[0].replaceAll('\n', '')}) {${
        inner[0]
      }}\n${post}`;
    },
    else: (code, index) => {
      const inner = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, [
        'end',
        'elseif',
      ]);

      return `else {${inner[0]}}\n`;
    },
    elseif: (code, index) => {
      const conditional = cappuccino.codeRunner(code, index, 'then');
      const inner = cappuccino.codeRunner(code, cappuccino.codeRunnerPosition, [
        'end',
        'else',
        'elseif',
      ]);
      let post = '';
      if (inner[1] == 'elseif')
        post = cappuccino.opcodes.elseif(code, cappuccino.codeRunnerPosition);
      if (inner[1] == 'else')
        post = cappuccino.opcodes.else(code, cappuccino.codeRunnerPosition);

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

  cappuccino.whitespaces = [' ', '\n', '\t', '(', ')', ",", "="];

  cappuccino.codeRunnerPosition = 0;

  //Runs through our code and compiles it to js
  cappuccino.codeRunner = (code, index, untilWord, untilNewline, wrapperIdentifier, prepend) => {
    let string = '';
    let word = '';

    for (
      cappuccino.codeRunnerPosition = index;
      cappuccino.codeRunnerPosition < code.length;
      cappuccino.codeRunnerPosition++
    ) {
      const char = code.charAt(cappuccino.codeRunnerPosition);
      if (cappuccino.whitespaces.includes(char) || char === untilNewline) {
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
        if (cappuccino.opcodes[word]) {
          //cappuccino.codeRunnerPosition++;
          string += cappuccino.opcodes[word](code, cappuccino.codeRunnerPosition,char,wrapperIdentifier);
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

  cappuccino.compile = code => {
    //Add an extra line for easy EOF detection
    return cappuccino.codeRunner(code + "\n", 0, ' ')[0];
  };
})();
