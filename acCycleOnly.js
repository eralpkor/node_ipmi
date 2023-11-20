// This script only do AC cycle.
import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https";
import { sleep, pingHost, timeStamp } from "./helper.js";
import { execFile } from "node:child_process";
import path from "node:path";
const ipmi_path = path.dirname("C:\\node_ipmi\\ipmi\\ipmitool.exe");
import file from "simple-node-logger";
import setup from "./setup.js";
// create a rolling file logger based on date/time that fires process events
const opts = {
  logFilePath: `logs/${setup.log_file}.log`,
  timestampFormat: "YYYY-MM-DD HH:mm:ss",
};
const log = file.createSimpleLogger(opts);
import { exit } from "node:process";

// // User inputs
let user = setup.user;
const pass = setup.pass;
const bmcIp = setup.bmcIp;
const cypher = setup.cypher;
const hours = setup.hours;
const testRunTime = hours * 3600000;
// const targetCount = setup.targetCount;
// let startOption = testOptions.startOptions;
// const logFile = testOptions.log_file;
// const log_file = log_path + `/${logFile}` + ".txt";
// console.log(bmcIp, user, pass, cypher, hours, log_file);
// console.log("Commands", testOptions.cycleCommands);
////////////////////////////////////////
// let user = "USERID";
// let pass = "Passw0rd123";
// let bmcIp = "10.244.17.23";
// let cypher = "17";
let ipmiCommand = [
  // ["0x00", "0x02", "0x00"],
  // ["0x00", "0x02", "0x01"],
  // ["0x00", "0x02", "0x02"],
  // ["0x00", "0x02", "0x03"],
  ["0x3a", "0x37", ""],
];

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
        log.error(`IPMI failed.... check your IP or connection ${err.message}`);
        console.error(`stderr: ${stderr}`);
        return;
      }
      if (data) {
        console.log(`ipmi command ${data.toString()}`);
        log.info(`IPMI command ${data.toString()}`);
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
    console.log("RedFish not ready yet ", error.response.status, retryCount);
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

let cycleCount = 1; //cycle cycleCount
const testStartTime = new Date().getTime();

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
  log.info(
    `*********** Cycle test start ${await timeStamp()} *********************`
  );
  log.info(
    `Test started on IP ${bmcIp}, will run  ${hours}hr/s, ${testRunTime}ms.`
  );
  log.info(
    `******************************************************************`
  );
  // do cycle until times up
  while (keepCalling) {
    let isPoweredOff = false;
    let eachCycleTime = new Date().getTime();

    // run all cycle commands
    for (index in ipmiCommand) {
      let command = ipmiCommand[index];
      eachCycleTime = new Date().getTime();

      log(`****** Cycle ${cycleCount} started ${eachCycleTime} ******`);
      if (!(await pingHost(bmcIp))) {
        isACCycled = true;
        log.info(`System is AC cycled.`);
      }

      if (
        (await systemStatus()) == "SystemOn_StartingUEFI" ||
        (await systemStatus()) == "SystemRunningInUEFI" ||
        (await systemStatus()) == "BootingOSOrInUndetectedOS"
      ) {
        isSystemBusy = true;
        log.info(`Is System Busy? ${isSystemBusy}`);
      }

      log.info(`System is ${await systemStatus()}`);
      // check system status to run ipmitool
      let waitCount = 1;

      // Wait until next IPMI command
      while (isSystemBusy) {
        if (waitCount > 60) {
          log.error(
            `Waited 20 minutes System state did not change. Exiting test ${await systemStatus()}`
          );
          exit(1);
        }

        log.info(`Wait for 20 seconds to detect system power state.`);
        await sleep(20000);
        log.info(`Waited 20 seconds, system state: ${await systemStatus()}`);
        // Check redFish state, if not OS booted or powered off keep checking
        if (
          (await systemStatus()) === "OSBooted" ||
          (await systemStatus()) === "SystemPowerOff_StateUnknown"
        ) {
          isSystemBusy = false;
          log.info(`Is System Busy booting ${isSystemBusy}`);
        }
        waitCount++;
      }
      log.info(`Sleep 20 Seconds before raw power command - ${command}`);
      log.info(`ipmi command for next cycle "${cycleCommands[index]}"`);

      await sleep(20000);
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
        log.info(`ipmi AC cycle command sent ${isACCycled}`);
      }
      log.info(` Sleep 30 seconds to check if raw ipmi command kicked in.`);
      await sleep(30000);
      isSystemBusy = true;
      // Check if ipmi off command turn off the system
      if (c === "0x00") {
        let waitCount = 1;
        while (!isPoweredOff) {
          if (waitCount > 30) {
            log.error(
              `Waited 10 minutes but System did not power off, test exited. Poser status ${await systemStatus()}`
            );
            exit(1);
          }
          log.info(`Sleep 20 seconds to check if system powered off.`);
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
            log.error(
              `Waited 10 minutes but System did not boot to OS, test stopped. Try count ${waitCount}. System status ${await systemStatus()}`
            );
            exit(1);
          }

          log.info(
            `Sleep 20 seconds to check if system boot into the OS yet. ${await systemStatus()}`
          );
          await sleep(20000);
          if ((await systemStatus()) === "OSBooted") {
            osBooted = true;
            log.info(`OS Booted status ${osBooted}`);
          } else {
            osBooted = false;
            log.info(`[INFO ] OS Booted status ${osBooted}`);
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

        while (isACCycled) {
          if (waitCount > 30) {
            log.error(
              `Waited 10 minutes but system did not recover from AC cycle, exit test. ${await systemStatus()} ${waitCount}`
            );
            exit(1);
          }
          log.info("Sleep 20 seconds to check if XCC is online.");
          await sleep(20000);

          if (await pingHost(bmcIp)) {
            isACCycled = false;
            log.info(`XCC is back online status ${isACCycled}`);
            await sleep(30000);
          } else {
            isACCycled = true;
            log.info(` XCC is not online yet. ${isACCycled}`);
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
      `******************** Cycle count ${cycleCount} ***********************`
    );
    log.info(
      `One Power cycle took ${
        new Date().getTime() - eachCycleTime
      } milliseconds.`
    );
    eachCycleTime = new Date().getTime();
    cycleCount++;
    console.log(
      "Test run time ",
      new Date().getTime() - testStartTime,
      new Date().getTime() - testStartTime > testRunTime
    );
    if (new Date().getTime() - testStartTime > testRunTime) {
      keepCalling = false;
    }
  }
  let testEndTime = new Date().getTime();
  log.info(`Cycle test ended. ${cycleCount} cycles completed.`);
  log.info(
    `************************ TEST COMPLETED ****************************`
  );
  log.info(`Test ran ${testEndTime - testStartTime} milliseconds`);
  log.info(
    `Test ran ${((testEndTime - testStartTime) / 3600000).toFixed(2)} hour/s.`
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
