import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https";
import { sleep, pingHost } from "./helper.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { appendFileSync } from "node:fs";
import config from "./config.js";
import dateTime from "./date.js";
// import commands from "./commands.js";
const ipmi_path = path.dirname("C:\\node_ipmi\\ipmi\\ipmitool.exe");
const log_path = path.dirname("C:\\node_ipmi\\logs\\test");
import file from "simple-node-logger";
// Call config script to Get user input
// const testOptions = await config();
// create a rolling file logger based on date/time that fires process events
const opts = {
  // logFilePath: "logs/TEST_LOG.log",
  logFilePath: "logs/chicago.log",
  timestampFormat: "YYYY-MM-DD HH:mm:ss",
};
const log = file.createSimpleLogger(opts);
import { exit } from "node:process";

// // User inputs
// let user = testOptions.xccUser;
// const pass = testOptions.xccPw;
// const bmcIp = testOptions.xccIp;
// const cypher = testOptions.cypher;
// let ipmiCommand = testOptions.cycleOptions;
// const hours = testOptions.hours;
const hours = 1;
const testRunTime = hours * 3600000;
const targetCount = 3;
// let startOption = testOptions.startOptions;
// const logFile = testOptions.log_file;
// const log_file = log_path + `/${logFile}` + ".txt";
// console.log(bmcIp, user, pass, cypher, hours, log_file);
// console.log("Commands", testOptions.cycleCommands);
////////////////////////////////////////
let user = "USERID";
let pass = "Passw0rd123";
let bmcIp = "10.244.17.23";
let cypher = "17";
// let ipmiCommand = ["off", "on", "cycle", "reset", "0x3a 0x37"];
let ipmiCommand = [
  ["0x00", "0x02", "0x00"],
  ["0x00", "0x02", "0x01"],
  ["0x00", "0x02", "0x02"],
  ["0x00", "0x02", "0x03"],
  ["0x3a", "0x37", ""],
];
// const logFile = "TestLog";
// const log_file = log_path + `/${logFile}` + ".txt";

// Agent for SSL Cert
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// IPMI tool to execute ipmi commands
const runIpmiTool = (a, b, c) => {
  execFile(
    // "C:/node_ipmi/ipmi/ipmitool.exe",
    `${ipmi_path}\\ipmitool.exe`,
    // -I lanplus -C 17 -H 10.244.17.29 -U USERID -P Passw0rd123 power status",
    [
      "-I",
      "lanplus",
      "-C",
      cypher,
      "-H",
      bmcIp,
      "-U",
      user,
      "-P",
      pass,
      "raw",
      a,
      b,
      c,
    ],
    function (err, data, stdout, stderr) {
      if (err) {
        console.log("IPMI failed.... check your IP or connection", err.message);
        log.error(
          `IPMI failed.... check your IP or connection ${data} ${err.message}`
        );
        console.error(`stderr: ${stderr}`);
        return;
      }
      if (data) {
        log.info(`IPMI command ${data.toString()}`);
        console.log(`ipmi command ${data.toString()}`);
        // console.log(`stdout: ${stdout}`);
      }
      // console.log(`stdout: ${stdout}`);
    }
  );
};

// use axios-retry
const client = axios.create();
axiosRetry(client, {
  retries: 20,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: function onRetry(retryCount, error, requestConfig) {
    console.log(error.message);
  },
});
// redfish system status check
async function systemStatus() {
  return client
    .get(`https://${bmcIp}/redfish/v1/Systems/1`, {
      timeout: 600000,
      retryDelay: axiosRetry.exponentialDelay,
      retryCount: 20,
      retries: 20,
      httpsAgent: agent,
      auth: {
        username: user,
        password: pass,
      },
    })
    .then((response) => response)
    .then((status) => {
      return status.data.Oem.Lenovo.SystemStatus;
    })
    .catch((error) => {
      console.log(`failed after`);
      console.log(
        `Error, cannot reach out to the server IP: ${bmcIp} `,
        error.toJSON().message
      );
      console.log("Whats axios error ", error.message);
      log.error(`Error, cannot reach out to the server IP: ${bmcIp}`);
      if (error.toJSON().message.includes(401)) {
        log.error(
          `Not authorized, check your username/password: ${user}, ${pass}`
        );
      }
      if (error.toJSON().message.includes(503)) {
        log.error(`BMC is not ready yet ${bmcIp}`);
        // await sleep(20000)
      }
      if (response.status === "503") {
        log.error(`BMC is not ready yet ${bmcIp}`);
      }
      // return error.toJSON().message;
      exit(error.toJSON().message);
    });
}

const cycleCommands = [
  "power off",
  // [["raw"], ["0x00"], ["0x02"], ["0x00"]],
  // "raw 0x00 0x02 0x00",
  "power on", //
  // "raw 0x00 0x02 0x01",
  "power cycle", // raw 0x3a 0x37 //
  // "raw 0x00 0x02 0x02",
  "power reset", //
  // "raw 0x00 0x02 0x03",
  "AC cycle",
  // "raw 0x3a 0x37",
];

const choices = ["off", "on", "cycle", "reset", "AC cycle"];
const indexes = [];
const commands = [];
// get real cycle commands from user selected commands.
// function compareChoices(arr1, arr2) {
//   for (const e of arr1) {
//     if (arr2.includes(e)) {
//       indexes.push(arr1.indexOf(e));
//     }
//   }
//   for (let i = 0; i < indexes.length; i++) {
//     commands.push(cycleCommands[indexes[i]]);
//   }
//   return commands;
// }
// const ipmiCycle = compareChoices(choices, testOptions.cycleCommands);
// AC cycle "raw 0x3a 0x37"
let cycleCount = 1; //cycle cycleCount
let targetCycle = 3;
const testStartTime = new Date().getTime();
// let startOption = true;

// Organize power commands for system status
function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}

// Run cycle test
(async () => {
  let index = 0;
  let isSystemBusy = false;
  let osBooted = false;
  let isACCycled = false;
  let keepCalling = true;
  log.info(`-------Loop ${testStartTime} ${cycleCount} ${dateTime} -----start`);
  log.info(
    `Test started on IP ${bmcIp}, will run ${testRunTime}ms or ${hours}hr/s`
  );
  log.info(
    `******************************************************************`
  );
  // do cycle until times up
  // while (cycleCount <= targetCycle) {
  while (keepCalling) {
    let isPoweredOff = false;
    // run all cycle commands
    for (index in ipmiCommand) {
      let command = ipmiCommand[index];
      if (!(await pingHost(bmcIp))) {
        isACCycled = true;
      }

      if (
        (await systemStatus()) == "SystemOn_StartingUEFI" ||
        (await systemStatus()) == "SystemRunningInUEFI" ||
        (await systemStatus()) == "BootingOSOrInUndetectedOS"
      ) {
        console.log("216 isSystemBusy state ", isSystemBusy, dateTime);
        isSystemBusy = true;
        console.log("218 isSystemBusy state ", isSystemBusy);
      }
      console.log(
        "188 command and state ",
        command,
        await systemStatus(),
        isSystemBusy
      );
      log.info(`System is ${await systemStatus()}`);
      // check system status to run ipmitool
      let waitCount = 1;

      console.log("201 isSystemBusy state ", isSystemBusy);
      // Wait until next IPMI command
      while (isSystemBusy) {
        if (waitCount > 60) {
          console.log(
            "Waited 20 minutes System state did not change exit loop ",
            waitCount,
            await systemStatus(),
            dateTime
          );
          log.error(
            `Waited 20 minutes System state did not change. Exiting test ${await systemStatus()}`
          );
          exit(1);
        }

        console.log("Wait for 20 secs ", await systemStatus());
        console.log(`222Wait for 20 seconds to detect system power state. `);
        console.log("225 isSystemBusy state ", isSystemBusy, dateTime);

        log.info(
          `Wait for 20 seconds to detect system power state. ${await systemStatus()}`
        );
        await sleep(20000);
        log.info(
          `Waited 20 secons system power state: ${await systemStatus()}`
        );
        // Check redFish state, if not OS booted or powered off keep checking
        if (
          (await systemStatus()) === "OSBooted" ||
          (await systemStatus()) === "SystemPowerOff_StateUnknown"
        ) {
          console.log("216 isSystemBusy state ", isSystemBusy, dateTime);
          isSystemBusy = false;
          console.log("218 isSystemBusy state ", isSystemBusy);
        }
        waitCount++;
      }
      console.log("234 isSystemBusy state ", isSystemBusy);
      console.log(
        "213 system status and power command ",
        await systemStatus(),
        ipmiCommand[index],
        dateTime
      );

      log.info(`Sleep 20 Seconds before raw power command - ${command}`);
      log.info(`IPMI command will send "${cycleCommands[index]}"`);

      await sleep(20000);
      log.info(`263 command ${command}`);
      let a = command[0];
      let b = command[1];
      let c = command[2];
      // Run ipmi command
      runIpmiTool(a, b, c);
      await sleep(2000);
      log.info(`Run ipmi command ${command}`);
      log.info(`IPMI command sent "${cycleCommands[index]}"`);
      await sleep(10000);
      if (a == "0x3a") {
        isACCycled = true;
        console.log("isACCycled ", isACCycled);
      }
      log.info(
        ` Sleep 30 seconds to check if raw ipmi command kicked in. ${dateTime}`
      );
      await sleep(30000);
      isSystemBusy = true;
      log.info("isSystemBusy is end of for loop ", isSystemBusy, dateTime);
      // Check ipmi power command to flag system status "OFF".
      log.info(
        "ipmi command and isPoweredOff ",
        ipmiCommand[index],
        isPoweredOff
      );
      // Check if ipmi off command turn off the system
      if (c === "0x00") {
        let waitCount = 1;
        while (!isPoweredOff) {
          if (waitCount > 30) {
            console.log(
              "Waited 10 minutes but System did not power off, exit loop ",
              waitCount,
              await systemStatus(),
              dateTime
            );
            log.error(
              `Waited 10 minutes but System did not power off, exit test. ${dateTime} `
            );
            exit(1);
          }
          log.info(`276 Sleep 20 seconds to check if system powered off.`);
          await sleep(20000);
          log.info(`System status ${await systemStatus()}`);
          if ((await systemStatus()) === "SystemPowerOff_StateUnknown") {
            isPoweredOff = true;
            log.info(`System powered off , ${isPoweredOff}`);
          } else {
            log.info(`276 [INFO] System did not powered off. ${isPoweredOff}`);
          }

          waitCount++;
        }
      }
      // Check if ipmi on command booted the OS
      if (c == "0x01") {
        let waitCount = 1;
        while (!osBooted) {
          if (waitCount > 30) {
            console.log(
              "Waited 10 minutes but System did not power on, exit loop ",
              waitCount,
              await systemStatus(),
              dateTime
            );
            log.error(
              `Waited 10 minutes but System did not boot to OS, exit test. ${dateTime} `
            );
            exit(1);
          }
          console.log(
            "307 Sleep 20 seconds to check if system boot into the OS yet."
          );
          log.info(
            `Sleep 20 seconds to check if system boot into the OS yet. ${await systemStatus()}`
          );
          await sleep(20000);
          if ((await systemStatus()) === "OSBooted") {
            osBooted = true;
            console.log("OS Booted continue with cycle ", osBooted);
            log.info(`OS Booted status ${osBooted} - ${dateTime}`);
          } else {
            osBooted = false;
            console.log("OS Did not boot yet. ", osBooted);
            log.info(`[INFO ] OS Booted status ${osBooted} - ${dateTime}`);
          }
          waitCount++;
        }
      }

      log.info(
        `Is BMC up? ${await pingHost(bmcIp)} ipmi command ${
          cycleCommands[index]
        }`
      );
      // Check ipmi power AC cycle command
      if (!(await pingHost(bmcIp))) {
        let waitCount = 1;
        isACCycled = true;
        // if (!pingHost) {
        //   isACCycled = true;
        // }
        while (isACCycled) {
          if (waitCount > 30) {
            log.error(
              `Waited 10 minutes but system did not recover from AC cycle, exit test. ${await systemStatus()} ${waitCount}`
            );
            exit(1);
          }
          log.info("Sleep 20 seconds to check if XCC is online.");
          await sleep(20000);

          // log.info(`BMC is down ${await systemStatus()}`);
          if (await pingHost(bmcIp)) {
            isACCycled = false;
            log.info(`XCC is back online status ${isACCycled} - ${dateTime}`);
            await sleep(30000);
          } else {
            isACCycled = true;
            log.info(` XCC is not online yet. ${isACCycled} - ${dateTime}`);
          }
          log.info(`wait count ${waitCount}`);
          waitCount++;
        }
      }
    }

    if (index === ipmiCommand.length) {
      index = 0;
    }
    log.info(
      "429 cycle count LOOP, time expired? ",
      cycleCount,
      new Date().getTime() - testStartTime > testRunTime
    );
    cycleCount++;
    if (new Date().getTime() - testStartTime > testRunTime) {
      keepCalling = false;
    }
  }
  let testEndTime = new Date().getTime();
  log.info(`Cycle test ended. ${cycleCount} cycles completed.`);
  log.info(`************************ ${dateTime} ****************************`);
  log.info(
    `Test ran ${testEndTime} - ${testStartTime} ${testRunTime} milliseconds`
  );
})();

// SystemOn_StartingUEFI
// SystemRunningInUEFI
// BootingOSOrInUndetectedOS
// SystemPowerOff_StateUnknown
// OSBooted

//////////////////////////////////////////
// commands split for raw command

// const regex = /\s/;
// let w = ipmiCommand.split(regex);
// console.log("whats w after split ", w, w[0], w[1]);
