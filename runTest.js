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
import pingHost from "./test.js";
const logfile = log_path + "/RunningLog_" + ".txt";

function printing(text, log_file) {
  console.log(text);
  try {
    appendFileSync(`${log_path}\\test.txt`, `Cycle test ${dateTime}\n`);
    console.log(`Log file ${dateTime}\n`);
  } catch (err) {
    console.log("something went wrong", err);
  }
}

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
      answer.chiper,
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
        console.log("IPMI failed.... check your IP or connection", err.message);
        // console.error(`stderr: ${stderr}`);

        return;
      }
      if (data) {
        console.log("IPMI command " + data.toString());
        // console.log(`stdout: ${stdout}`);
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};

// const url = `https://${answer.xcc_ip}/redfish/v1/Systems/1`;
// const status = [
//   "OSBooted",
//   "SystemRunningInSetup",
//   "SystemPowerOff_StateUnknown",
//   "SystemOn_StartingUEFI",
//   "SystemRunningInUEFI",
//   "BootingOSOrInUndetectedOS",
// ];

const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function systemStatus(answer) {
  return axios
    .get(`https://${answer.xcc_ip}/redfish/v1/Systems/1`, {
      httpsAgent: agent,
      auth: {
        username: answer.xcc_user,
        password: answer.xcc_pw,
      },
    })
    .then((response) => response)
    .then((status) => {
      return status.data.Oem.Lenovo.SystemStatus;
    })
    .catch((error) => {
      // console.log("Axios error ", error.response);
      console.log("Whats json ", error.toJSON().message);
      return;
      // if (error.response) {
      //   // The request was made and the server responded with a status code
      //   // that falls out of the range of 2xx
      //   console.log(error.response.data);
      //   console.log(error.response.status);
      //   console.log(error.response.headers);
      // } else if (error.request) {
      //   // The request was made but no response was received
      //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      //   // http.ClientRequest in node.js
      //   console.log(error.request);
      // } else {
      //   // Something happened in setting up the request that triggered an Error
      //   console.log("Error", error.message);
      // }
      // console.log(error.config);
    });
}

const cycleOptions = [];
// check system status refish, on or off
// starting test
async function execute() {
  try {
    const answer = await config();
    const ipmi = await runIpmiTool(answer);
    const startTime = new Date().getTime();
    console.log("Settings ", answer);
    // chosen cycle options
    console.log("\nCycle test will start with these options: ", answer.options);
    // loop till test execution time ends
    // for (let i = 0; i < answer.options.length; i++) {
    //   cycleOptions.push(answer.options[i]);

    // if (!pingHost([answer.xcc_ip])) {
    //   console.log("Cannot ping host ip...");
    //   return;
    // }
    // }
    const timer = +answer.hours * 60 * 60 * 1000;
    console.log(`Test will run ${+answer.hours} hours ${timer} milliseconds.`);

    for (let i = 1; i < 200; i++) {
      const getSystemStatus = await systemStatus;
      console.log("startTime ", startTime);
      console.log("System status ", getSystemStatus);

      await new Promise((resolve) => setTimeout(resolve, 5000));
      console.log(`\nChecking ${i} times.`);
      console.log("Wait for 20 seconds to detect OS booted status.");
      //
      // Kill the test when times up
      if (new Date().getTime() - startTime > 30000) {
        try {
          appendFileSync(
            `${log_path}\\test.txt`,
            `Cycle test ended on ${dateTime}\n`
          );
          console.log(`Cycle test ended on ${dateTime}\n`);
        } catch (err) {
          console.log("something went wrong", err.cause.code);
          if (err) {
            return;
          }
        }
        console.log(new Date().getTime() - startTime);
        return;
      }

      let start = new Date().getTime();
      let end = start + 30000;
      let loop = new Date(start);
      while (loop <= end) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        let status = await getSystemStatus(answer);
        console.log("Reading System Status using RedFish.. ", status);
        console.log("Loop, end and start ", loop, end, start);
        console.log("running while loop ", new Date().getTime() - startTime);
        console.log("Checking BMC ", answer.xcc_ip);
        var newDate = loop.setDate(loop.getTime() + 5000);
        loop = new Date(newDate);
      }
      // SystemPowerOff_StateUnknown
      if (status == "OSBooted") {
        console.log(
          "System is on, sleeping 10 seconds to power off ",
          getSystemStatus
        );
        // await new Promise((resolve) => setTimeout(resolve, 10000));

        console.log(
          "Test been running, time: ",
          new Date().getTime() - startTime
        );
      }

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
