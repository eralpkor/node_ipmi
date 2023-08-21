// const fs = require("fs");

// fs.writeFileSync("./logs/test.txt", "Hey there!\n");

// Write LOG file
// import { appendFileSync } from "node:fs";

// try {
//   appendFileSync("./logs/test.txt", "Hello there!\n");
//   console.log('The "data to append" was appended to file!');
// } catch (err) {
//   console.log("something went wrong", err);
// }

import { exec } from "node:child_process";
import ping from "ping";

// exec("CheckLink.bat", (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.error(`stderr: ${stderr}`);
// });

const hosts = ["10.244.16.136"];
const frequency = 5000;

const pingHost = (host) => {
  host.forEach(function (host) {
    setInterval(() => {
      ping.sys.probe(host, function (isAlive) {
        var msg = isAlive
          ? "host " + host + " is alive"
          : "host " + host + " is dead";
        console.log(isAlive);
        return isAlive;
      });
    }, frequency);
  });
};
// pingHost(hosts);
// console.log(pingHost());
export default pingHost;

// host.forEach(function (host) {
//   setInterval(() => {
//     ping.sys.probe(host, function (isAlive) {
//       var msg = isAlive
//         ? "host " + host + " is alive"
//         : "host " + host + " is dead";
//       console.log(msg);
//     });
//   }, freq);
// });
