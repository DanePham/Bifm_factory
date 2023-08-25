import { loadPyodide } from "pyodide";
import fetch from "node-fetch";
globalThis.fetch = fetch;

let pyodide = await loadPyodide({
    indexURL: `node_modules/pyodide`,
});

// await pyodide.loadPackage("micropip")
// const micropip = pyodide.pyimport("micropip");

await pyodide.loadPackage(
    "./Lib/wcwidth-0.2.5-py2.py3-none-any.whl",
);
await pyodide.loadPackage(
    "./Lib/ftfy-6.0-py3-none-any.whl"
);

// await pyodide.loadPackage(
//     "https://raw.githubusercontent.com/josephrocca/ftfy-pyodide/main/wcwidth-0.2.5-py2.py3-none-any.whl",
// );
// await pyodide.loadPackage(
//     "https://raw.githubusercontent.com/josephrocca/ftfy-pyodide/main/ftfy-6.0-py3-none-any.whl"
// );

pyodide.runPython('import ftfy');

export default pyodide.globals.get('ftfy');