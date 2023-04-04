const { Worker } = require("worker_threads");
// import { Worker } from 'worker_threads';

const THREADS_AMOUNT = 4;
const LIMIT = 300;

const OFFSET = 0; // define import image or info
const FILE_IMPORT = "./ChildThreadBifm.js"; // define import image or info

async function worker_import() {
  var params = [];
  params.push({ offset: 0 });
  // Array of promises
  let promises = [];
  for (let idx = 1; idx <= THREADS_AMOUNT; idx += 1) {
    // Add promise in the array of promises
    promises.push(
      new Promise((resolve) => {
        let offset = idx + (OFFSET * THREADS_AMOUNT - 1);
        params.push({ offset: offset });
        const worker = new Worker(FILE_IMPORT, {
          workerData: {
            workerId: idx,
            params: params[idx],
            limit: LIMIT,
            offset: OFFSET,
          },
        });

        worker.on("exit", () => {
          console.log("Closing ", idx);
          resolve();
        });

        //recived worker reponse
        worker.on("message", (value) => {
          console.log(`message received from ${idx}: ${value}`);
        });
      })
    );
  }
  // Handle the resolution of all promises
  return Promise.all(promises)
    .then(() => {
      console.log("OK import");
    })
    .catch((e) => {
      // handle errors here
      console.log(e);
    });
}

worker_import();
