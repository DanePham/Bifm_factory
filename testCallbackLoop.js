function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};
// var count = 0;
// for( var i = 0; i <= 10; i++ ){

//     setTimeout((n) => {
//         console.log(n);
//     }, 1000, i);
// }

var listId = range(1, 5);

const promises = listId.map(prop => new Promise(resolve => {

    let timer = 1000;

    if(prop == 3) timer = 2000;

    setTimeout((n) => {
        console.log(n);

        resolve(true);
    }, timer, prop);
}));

(async () => {
    await Promise.all(promises).then(() => {
        console.log("OK");
    });

    // if (result.some(r => r === false)) {
    //     // if any of the ratio is invalid, redirect
    //     console.log(r);
    // } else {
    //     // else upload
    //     console.log('OK');
    // }
})();
// console.log(promises);