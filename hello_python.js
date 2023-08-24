// hello_python.js
// const { loadPyodide } = require("pyodide");
// import loadPyodide from 'pyodide';
import { loadPyodide } from "pyodide";
import fetch from "node-fetch";
globalThis.fetch = fetch;
async function hello_python() {
    
    let pyodide = await loadPyodide({
        indexURL: `node_modules/pyodide`,
    });


    // var pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip")
    const micropip = pyodide.pyimport("micropip");
    await micropip.install('scipy')
    var scipy = await pyodide.loadPackage("scipy");
    var numpy = await pyodide.loadPackage("numpy");
    // var ftfy = await pyodide.loadPackage("ftfy");

    // pyodide.runPythonAsync(`
    //     import micropip
    //     await micropip.install('https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/josephrocca/ftfy-pyodide/blob/v0.1/wcwidth-0.2.5-py2.py3-none-any.whl')
    //     await micropip.install('https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/josephrocca/ftfy-pyodide/blob/v0.1.1/ftfy-6.0-py3-none-any.whl')
    //     import ftfy
    // `);

    await pyodide.loadPackage(
        "https://raw.githubusercontent.com/josephrocca/ftfy-pyodide/main/wcwidth-0.2.5-py2.py3-none-any.whl",
    );
    await pyodide.loadPackage(
        "https://raw.githubusercontent.com/josephrocca/ftfy-pyodide/main/ftfy-6.0-py3-none-any.whl"
    );

    // await pyodide.runPythonAsync(`
    //     from pyodide.http import pyfetch
    //     response = await pyfetch("https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/josephrocca/ftfy-pyodide/blob/v0.1.1/ftfy-6.0-py3-none-any.whl") # .zip, .whl, ...
    //     await response.unpack_archive() # by default, unpacks to the current dir
    // `)

    // await pyodide.runPythonAsync(`
    //     from pyodide.http import pyfetch
    //     response = await pyfetch("https://.../your_package.tar.gz") # .zip, .whl, ...
    //     await response.unpack_archive() # by default, unpacks to the current dir
    // `)

    // imports
    pyodide.runPython('import numpy as np')
    pyodide.runPython('import scipy.special')
    pyodide.runPython('import scipy.special as sp')
    pyodide.runPython('from scipy.special import betaln, beta as betafn')
    pyodide.runPython('import ftfy')


    var ftfy = pyodide.globals.get('ftfy');

    let text = 'TrÃ  Oolong Kim TuyÃªn Cáº§u Äáº¥t - Há»™p 220Gr - Dalat Farm';
    let text_fix = ftfy.fix_encoding(text);

console.log(text_fix);
    // testing with JavaScript arguments
    // var x = pyodide.globals.get('np').ones(pyodide.toPy([3, 3])).toJs()
    // console.log(x) // works!
    // var x = pyodide.globals.get('np').exp(pyodide.toPy([3])).toJs()
    // console.log(x) // works!
    
    // don't work?
    // try {
    //     var x = pyodide.globals.get('sp').beta(pyodide.toPy([3.1, 3.1])).toJs()
    //     console.log(x)
    // } catch (e) { console.log('thats a nope') }
    
    // try {
    //     var x = pyodide.globals.get('scipy.special').beta(pyodide.toPy([3, 2])).toJs()
    //     console.log(x)
    // } catch (e) { console.log('thats a nope') }

    // try {
    //     var x = pyodide.globals.get('betaln')(pyodide.toPy([3, 2])).toJs()
    //     console.log(x)
    // } catch (e) { console.log('thats a nope') }

    // testing inside Python works fine
    // pyodide.runPython('print(sp.beta(3, 2))')
    // pyodide.runPython('print(scipy.special.beta(3, 2))')
    // pyodide.runPython('print(betaln(3, 2))')

    // await pyodide.loadPackage("micropip");
    // await pyodide.loadPackage("ftfy");
    // pyodide.runPythonAsync(`
    //     import micropip
    //     await micropip.install('https://deno.land/x/ftfy_pyodide@v0.1/wcwidth-0.2.5-py2.py3-none-any.whl')
    //     await micropip.install('https://deno.land/x/ftfy_pyodide@v0.1/ftfy-6.0-py3-none-any.whl')
    //     import ftfy
    // `);
    // // return pyodide.globals.get("ftfy");

    // return pyodide;
}

hello_python()
// .then((result) => {
// //   console.log("Python says that 1+1 =", result);
// //   console.log(result.fix_text("(à¸‡'âŒ£')à¸‡"));
//   console.log(result);
// })
;