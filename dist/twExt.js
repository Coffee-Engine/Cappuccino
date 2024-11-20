(function(Scratch) {
    window.cappuccino={},cappuccino.opcodes={repeat(e,n){let o=cappuccino.codeRunner(e,n,"until"),r=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,null,"\n");return`while (!(${r[0].replaceAll("\n","")})) {${o[0]}}`},while(e,n){let o=cappuccino.codeRunner(e,n,"do"),r=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,"end");return`while (${o[0].replaceAll("\n","")}) {${r[0]}}`},for(e,n){let o="for (let ",r=cappuccino.codeRunner(e,n,!1,"="),t=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,"do",!1);"="==t[0].charAt(0)&&(t[0]=t[0].replace("=",""));let c=t[0].split(",");switch(c.length){case 1:console.error(`Error while parsing Cappuchino code, For loop incomplete at character ${n}.`);break;case 2:o+=`${r[1]} = ${c[0]}; ${r[1]} > ${c[1]}; ${r[1]}++`;break;case 3:o+=`${r[1]} = ${c[0]}; ${r[1]} > ${c[1]}; ${r[1]}+=${c[2]}`;break;default:console.error(`Error while parsing Cappuchino code, For loop invalid at character ${n}.`)}let s=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,"end");return o+`) {${s[0]}}`},function(e,n,o,r){let t=cappuccino.codeRunner(e,n,null,"\n"),c=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,"end");return`${"class"==r?"":"function"} ${t[0].replaceAll("\n","")} {${c[0]}}`},class(e,n,o,r){let t=cappuccino.codeRunner(e,n,["from","constructed"],"\n"),c=`class ${t[0]}`,s=[];if("from"==t[1]&&(c+=` extends ${(s=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["constructed","contains"],"\n"))[0]}`),"constructed"==t[1]||"constructed"==s[1]){let i=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["contains"],")",r,!0);cappuccino.codeRunnerPosition+=1;let d=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["contains"],!1);c+=`{ constructor ${i[0].length>1?i[0]:"()"} {${d[0]}}`}else c.endsWith("contains")&&(c=c.substring(0,c.length-8)),c+=`${s.length>0?"{\n constructor() \n{\nsuper()\n}\n":"{\n constructor() {}\n"}`;let a=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,"end",!1,"class");return`${c+=a[0]}}`},if(e,n){let o=cappuccino.codeRunner(e,n,"then"),r=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["end","else","elseif",]),t="";return"elseif"==r[1]&&(t=cappuccino.opcodes.elseif(e,cappuccino.codeRunnerPosition)),"else"==r[1]&&(t=cappuccino.opcodes.else(e,cappuccino.codeRunnerPosition)),`if (${o[0].replaceAll("\n","")}) {${r[0]}}${t}`},else(e,n){let o=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["end","elseif",]);return`else {${o[0]}}`},elseif(e,n){let o=cappuccino.codeRunner(e,n,"then"),r=cappuccino.codeRunner(e,cappuccino.codeRunnerPosition,["end","else","elseif",]),t="";return"elseif"==r[1]&&(t=cappuccino.opcodes.elseif(e,cappuccino.codeRunnerPosition)),"else"==r[1]&&(t=cappuccino.opcodes.else(e,cappuccino.codeRunnerPosition)),`else if (${o[0].replaceAll("\n","")}) {${r[0]}}${t}`},print:(e,n,o)=>`console.log${o}`,and:(e,n,o)=>`&&${o}`,or:(e,n,o)=>`||${o}`,not:(e,n,o)=>`!${o}`},cappuccino.whitespaces=[" ","\n","	","(",")",",","="],cappuccino.codeRunnerPosition=0,cappuccino.codeRunnerOpcode=!1,cappuccino.lastChar="",cappuccino.comboStoppers={"//"(e,n){"\n"==e&&(cappuccino.codeRunnerOpcode=!1)},"/*"(e,n){"*/"==`${n}${e}`&&(cappuccino.codeRunnerOpcode=!1)},'"'(e,n){('"'==e&&"\\"!=n||"\n"==e)&&(cappuccino.codeRunnerOpcode=!1)},"'"(e,n){("'"==e&&"\\"!=n||"\n"==e)&&(cappuccino.codeRunnerOpcode=!1)},"`"(e,n){"`"==e&&"\\"!=n&&(cappuccino.codeRunnerOpcode=!1)}},cappuccino.codeRunner=(e,n,o,r,t,c)=>{let s="",i="";for(cappuccino.codeRunnerPosition=n;cappuccino.codeRunnerPosition<e.length;cappuccino.codeRunnerPosition++){let d=e.charAt(cappuccino.codeRunnerPosition);if(cappuccino.codeRunnerOpcode){cappuccino.codeRunnerOpcode(d,cappuccino.lastChar),s+=d,cappuccino.lastChar=d;continue}if(cappuccino.comboStoppers[`${cappuccino.lastChar}${d}`]||cappuccino.comboStoppers[`${d}`]){cappuccino.codeRunnerOpcode=cappuccino.comboStoppers[`${cappuccino.lastChar}${d}`]||cappuccino.comboStoppers[`${d}`],console.log(i),s+=i+d,i="",cappuccino.lastChar=d;continue}if(cappuccino.whitespaces.includes(d)||d===r){if(Array.isArray(o)){if(o.includes(i))return cappuccino.lastChar=d,[s,i]}else if(i===o)return cappuccino.lastChar=d,[s,i];if(d===r)return c?(s+=i,s+=d):(s+=d,s+=i),cappuccino.lastChar=d,[s,i];cappuccino.opcodes[i]?(s+=cappuccino.opcodes[i](e,cappuccino.codeRunnerPosition,d,t),cappuccino.lastChar=d):(s+=i,s+=d,cappuccino.lastChar=d),i=""}else i+=d,cappuccino.lastChar=d}return cappuccino.lastChar="",[s,i]},cappuccino.compile=e=>cappuccino.codeRunner(e+"\n",0," ")[0],window.monaco&&(monaco.languages.register({id:"cappu"}),monaco.languages.setMonarchTokensProvider("cappu",{keywords:["and","break","continue","do","else","elseif","end","false","for","function","if","let","const","null","not","or","repeat","return","then","true","until","while","class","from","constructed","contains",],operators:["+","-","*","/","%","^","#","==","~=","<=",">=","<",">","=",";",":",",",],symbols:/[=><!~?:&|+\-*\/\^%]+/,escapes:/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,digits:/\d+(_+\d+)*/,octaldigits:/[0-7]+(_+[0-7]+)*/,binarydigits:/[0-1]+(_+[0-1]+)*/,hexdigits:/[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,regexpctl:/[(){}\[\]\$\^|\-*+?\.]/,regexpesc:/\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,tokenizer:{root:[[/[{}]/,"delimiter.bracket"],{include:"common"}],common:[[/#?[a-z_$][\w$]*/,{cases:{"@keywords":"keyword","@default":"identifier"}}],[/[A-Z][\w\$]*/,"type.identifier"],{include:"@whitespace"},[/\/(?=([^\\\/]|\\.)+\/([dgimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,{token:"regexp",bracket:"@open",next:"@regexp"}],[/[()\[\]]/,"@brackets"],[/[<>](?!@symbols)/,"@brackets"],[/!(?=([^=]|$))/,"delimiter"],[/@symbols/,{cases:{"@operators":"delimiter","@default":""}}],[/(@digits)[eE]([\-+]?(@digits))?/,"number.float"],[/(@digits)\.(@digits)([eE][\-+]?(@digits))?/,"number.float"],[/0[xX](@hexdigits)n?/,"number.hex"],[/0[oO]?(@octaldigits)n?/,"number.octal"],[/0[bB](@binarydigits)n?/,"number.binary"],[/(@digits)n?/,"number"],[/[;,.]/,"delimiter"],[/"([^"\\]|\\.)*$/,"string.invalid"],[/'([^'\\]|\\.)*$/,"string.invalid"],[/"/,"string","@string_double"],[/'/,"string","@string_single"],[/`/,"string","@string_backtick"]],whitespace:[[/[ \t\r\n]+/,""],[/\/\*\*(?!\/)/,"comment.doc","@jsdoc"],[/\/\*/,"comment","@comment"],[/\/\/.*$/,"comment"]],comment:[[/[^\/*]+/,"comment"],[/\*\//,"comment","@pop"],[/[\/*]/,"comment"]],jsdoc:[[/[^\/*]+/,"comment.doc"],[/\*\//,"comment.doc","@pop"],[/.*[@]example/,"comment.doc.keyword"],[/.*[@]returns/,"comment.doc.keyword","@jsdocSyntax"],[/.*[@]return/,"comment.doc.keyword","@jsdocSyntax"],[/.*[@]param/,"comment.doc.keyword","@jsdocSyntax"],[/[\/*]/,"comment.doc"]],jsdocSyntax:[[/\{.*\}/,"comment.doc.type","@pop"],],regexp:[[/(\{)(\d+(?:,\d*)?)(\})/,["regexp.escape.control","regexp.escape.control","regexp.escape.control"]],[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,["regexp.escape.control",{token:"regexp.escape.control",next:"@regexrange"}]],[/(\()(\?:|\?=|\?!)/,["regexp.escape.control","regexp.escape.control"]],[/[()]/,"regexp.escape.control"],[/@regexpctl/,"regexp.escape.control"],[/[^\\\/]/,"regexp"],[/@regexpesc/,"regexp.escape"],[/\\\./,"regexp.invalid"],[/(\/)([dgimsuy]*)/,[{token:"regexp",bracket:"@close",next:"@pop"},"keyword.other"]]],regexrange:[[/-/,"regexp.escape.control"],[/\^/,"regexp.invalid"],[/@regexpesc/,"regexp.escape"],[/[^\]]/,"regexp"],[/\]/,{token:"regexp.escape.control",next:"@pop",bracket:"@close"}]],string_double:[[/[^\\"]+/,"string"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/"/,"string","@pop"]],string_single:[[/[^\\']+/,"string"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/'/,"string","@pop"]],string_backtick:[[/\$\{/,{token:"delimiter.bracket",next:"@bracketCounting"}],[/[^\\`$]+/,"string"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/`/,"string","@pop"]],bracketCounting:[[/\{/,"delimiter.bracket","@bracketCounting"],[/\}/,"delimiter.bracket","@pop"],{include:"common"}]}}));
    
    class cappuccino4TW {
        getInfo() {
            return {
                id: 'CECappuccino',
                name: 'Cappuccino Scripting',
                blocks: [
                    {
                        opcode: 'runCode_Command',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'eval Cappuccino [CODE]',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'alert("hello cappuccino")'
                            }
                        }
                    },
                    {
                        opcode: 'runCode_Reporter',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'eval Cappuccino [CODE]',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'alert("hello cappuccino")'
                            }
                        }
                    },
                    {
                        opcode: 'runCode_Boolean',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'eval Cappuccino [CODE]',
                        arguments: {
                            CODE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'alert("hello cappuccino")'
                            }
                        }
                    }
                ]
            }
        }

        runCode_Command({ CODE }) {
            return eval(cappuccino.compile(CODE));
        }

        runCode_Reporter({ CODE }) {
            return eval(cappuccino.compile(CODE));
        }

        runCode_Boolean({ CODE }) {
            return eval(cappuccino.compile(CODE));
        }
    }

    Scratch.extensions.register(new cappuccino4TW());
})(Scratch);
