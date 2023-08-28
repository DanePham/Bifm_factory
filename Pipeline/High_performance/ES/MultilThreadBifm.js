// const { Worker } = require("worker_threads");
// import ftfy from './ftfy.js'
import { Worker } from 'worker_threads'

const THREADS_AMOUNT = 4;
// const THREADS_AMOUNT = 1;
// const THREADS_AMOUNT = 3;
const LIMIT = 300;

const OFFSET = 0; 
const FILE_IMPORT = "./ChildThreadBifm.js"; 

const params = [
  {
    site: 'lazada', 
    tableCrawler: 'lazada_crawler'
  },
  {
    site: 'chotot', 
    tableCrawler: 'chotot_crawler'
  },
  {
    site: 'shopee', 
    tableCrawler: 'shopee_crawler'
  },
  {
    site: 'tiki', 
    tableCrawler: 'tiki_crawler'
  }
]; 


async function worker_import() {
  // var params = [];
  // params.push({ offset: 0 });
  // Array of promises
  let promises = [];
  for (let idx = 1; idx <= THREADS_AMOUNT; idx += 1) {
    // Add promise in the array of promises
    promises.push(
      new Promise((resolve) => {
        // let offset = idx + (OFFSET * THREADS_AMOUNT - 1);
        // params.push({ offset: offset });
        const worker = new Worker(FILE_IMPORT, {
          workerData: {
            workerId: idx,
            params: params[idx-1],
            limit: LIMIT,
            offset: OFFSET
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
      console.log("OK ETL");
      worker_import();
    })
    .catch((e) => {
      // handle errors here
      console.log(e);
    });
}

worker_import();
