const inCode = document.getElementById("in");
const outCode = document.getElementById("out");
const compile = document.getElementById("compile");

compile.onclick = () => {
    outCode.value = cappuccino.compile(inCode.value)
}
