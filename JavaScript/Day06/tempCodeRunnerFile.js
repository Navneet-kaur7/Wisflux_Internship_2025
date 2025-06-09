
console.log("=== Callback Hell ===");
setTimeout(() => {
  console.log("Step 1");
  setTimeout(() => {
    console.log("Step 2");
    setTimeout(() => {
      console.log("Step 3");

      
      runPromiseChain();
    }, 1000);
  }, 1000);
}, 1000);


function wait(msg) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(msg);
      resolve();
    }, 1000);
  });
}

function runPromiseChain() {
  console.log("\n=== Promise Chain ===");
  wait("Step 1")
    .then(() => wait("Step 2"))
    .then(() => wait("Step 3"))
    .then(() => runAsyncAwait()); 

}
async function runAsyncAwait() {
  console.log("\n=== Async/Await ===");
  await wait("Step 1");
  await wait("Step 2");
  await wait("Step 3");
}
