function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default sleep;

// async function countdown() {
//   for (let i = 0; i < 5; i++) {
//     console.log(`Waiting 5 seconds...`);
//     await sleep(5 * 1000);
//     checkPower();
//   }
//   console.log("Done");
// }
