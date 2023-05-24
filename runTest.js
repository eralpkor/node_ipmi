import axios from "axios";
import https from "https";
import sleep from "./helper.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { appendFileSync } from "node:fs";
import config from "./config.js";
import dateTime from "./date.js";
import commands from "./commands.js";
const ipmi_path = path.dirname("C:\\node_ipmi\\ipmi\\ipmitool.exe");
const log_path = path.dirname("C:\\node_ipmi\\logs\\test");

// Using runIpmitool to execute test
async function ipmiCommand() {
  try {
    console.log("Start ");
    try {
      appendFileSync(`${log_path}\\test.txt`, `Cycle test ${dateTime}\n`);
      console.log(`Log file ${dateTime}\n`);
    } catch (err) {
      console.log("something went wrong", err);
    }
    // Wait for the user to enter SUT info
    const answer = await config();
    const testRunTime = answer.hours * 60 * 60;
    console.log("test run time ", testRunTime);
    await console.log("Sleeping 5 seconds before starting cycle...");
    // await sleep(5 * 1000);
    await console.log(`\nTest started on: ${dateTime}\n`);
    console.log("Answers ", answer);
    // Run the IPMI commands
    runIpmiTool(answer);
    // for (let i = 0; i < 3; i++) {
    //   let powerOptions = answer.options[i];
    //   runIpmiTool(answer);
    //   // give time for console log
    //   await new Promise((resolve) => setTimeout(resolve, 3000));
    //   console.log("running ", i);
    // }
    // runIpmiTool(answer);
    // return runIpmiTool(answer);
  } catch (error) {
    console.log("Something went wrong: ", error);
  }
  console.log("End ");
}

const runIpmiTool = (answer) => {
  execFile(
    // "C:/node_ipmi/ipmi/ipmitool.exe",
    `${ipmi_path}\\ipmitool.exe`,
    // -I lanplus -C 17 -H 10.244.17.29 -U USERID -P Passw0rd123 power status",
    [
      "-I",
      "lanplus",
      "-C",
      "17",
      "-H",
      // "10.244.17.29",
      answer.xcc_ip,
      "-U",
      answer.xcc_user,
      "-P",
      answer.xcc_pw,
      // commands.power,
      // commands.powerStatus,
      // answer.options,
      "power",
      "status",
    ],
    function (err, data, stdout, stderr) {
      if (err) {
        console.log(err.message);
        console.error(`stderr: ${stderr}`);

        return;
      }
      if (data) {
        console.log("Send IPMI command " + data.toString());
        // console.log(`stdout: ${stdout}`);
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};

const url = "https://10.244.16.136/redfish/v1/Systems/1";
const status = [
  "OSBooted",
  "SystemRunningInSetup",
  "SystemPowerOff_StateUnknown",
  "SystemOn_StartingUEFI",
  "SystemRunningInUEFI",
  "BootingOSOrInUndetectedOS",
];

const agent = new https.Agent({
  rejectUnauthorized: false,
});

const systemStatus = axios
  .get(url, {
    httpsAgent: agent,
    auth: {
      username: "USERID",
      password: "Passw0rd123",
    },
  })
  .then((response) => response)
  .then((status) => {
    return status.data.Oem.Lenovo.SystemStatus;
  });

async function execute() {
  try {
    const answer = await config();
    const ipmi = await runIpmiTool(answer);
    const startTime = new Date().getTime();
    console.log("IPMI command ", answer.options);
    // loop till test execution time ends
    for (let i = 1; i < 200; i++) {
      const getSystemStatus = await systemStatus;
      console.log("startTime ", startTime);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log(`\nChecking ${i} times.`);
      //
      console.log("Reading System Status using RedFish.. ", getSystemStatus);

      if (getSystemStatus == status[0]) {
        // console.log("Date/Time from XCC: ")
        console.log("Status.. ");
        console.log("end time ", new Date().getTime() - startTime);
        if (new Date().getTime() - startTime > 30000) {
          return;
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong... ", error);
  }
}

execute();

// console.log("\x1b[36m%s\x1b[0m", "I am cyan"); // Cyan
// console.log("\x1b[33m%s\x1b[0m", "yellow"); // Yellow

// const  redFishGetStatus = () =>{
//   return axios
//     .get(url, {
//       httpsAgent: agent,
//       auth: {
//         username: "USERID",
//         password: "Passw0rd123",
//       },
//     })
//     .then((r) => {
//       let data = r.data.Oem.Lenovo;
//       // if (data.SystemStatus == "OSBooted") {
//       //   console.log("on", data.SystemStatus);
//       // }
//       // console.log(
//       //   "\nCurrent Chassis Power State: " + "\x1b[36m%s\x1b[0m",
//       //   data.SystemStatus
//       // );
//       // console.log(
//       //   "\nCurrent System Status: " + "\x1b[36m%s\x1b[0m",
//       //   data.SystemStatus
//       // );
//       return data.SystemStatus;
//     })
//     .catch((err) => {
//       console.log("Didn't work ", err);
//     });
// }

// const redFishGetPower = () => {
//   return axios
//     .get(url, {
//       httpsAgent: agent,
//       // responseType: "json",
//       // "content-Type": "application/json",
//       // Auth: "Basic",
//       auth: {
//         username: "USERID",
//         password: "Passw0rd123",
//       },
//     })
//     .then((r) => {
//       console.log(
//         "\nCurrent Chassis Power State: " + "\x1b[36m%s\x1b[0m",
//         r.data.PowerState
//       );
//     })
//     .catch((err) => {
//       console.log("Didnt work ", err.cause);
//     });
// };

// let interval = setInterval(() => {
//   if (new Date().getTime() - startTime > 30000) {
//     clearInterval(interval);
//     return;
//   }
// }, 2000);
