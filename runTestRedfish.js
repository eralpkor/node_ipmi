import axios from "axios";
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
// replace running log from the answers config file name
import log from "log-to-file";

// Call config script to Get user input
const testOptions = await config();

// User inputs
const user = testOptions.xccUser;
const pass = testOptions.xccPw;
const bmcIp = testOptions.xccIp;
const cypher = testOptions.cypher;
let ipmiCommand = testOptions.cycleOptions;
const hours = testOptions.hours;
const startOption = testOptions.startOption;
const logFile = testOptions.log_file;
let log_file = log_path + `/${logFile}` + ".txt";

// Agent for SSL Cert
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// IPMI tool to execute ipmi commands
const runIpmiTool = (answer) => {
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
      answer,
      // "power",
      // "status",
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
      // console.log(`stdout: ${stdout}`);
    }
  );
};

// redfish system status check
async function systemStatus(xccIp, user, password) {
  return axios
    .get(`https://${xccIp}/redfish/v1/Systems/1`, {
      httpsAgent: agent,
      auth: {
        username: user,
        password: password,
      },
    })
    .then((response) => response)
    .then((status) => {
      return status.data.Oem.Lenovo.SystemStatus;
    })
    .catch((error) => {
      console.log(
        "Error, cannot reach out to the server. ",
        error.toJSON().message
      );
      return;
    });
}

const cycleCommands = [
  "power off",
  "power on",
  "power cycle",
  "power reset",
  "power soft",
  "raw 0x3a 0x37",
];
const choices = ["off", "on", "cycle", "reset", "soft", "AC cycle"];
const indexes = [];
const commands = [];
// get real cycle commands from user selected commands.
function compareChoices(arr1, arr2) {
  for (const e of arr1) {
    if (arr2.includes(e)) {
      indexes.push(arr1.indexOf(e));
    }
  }
  for (let i = 0; i < indexes.length; i++) {
    commands.push(cycleCommands[indexes[i]]);
  }
  return commands;
}
const ipmiCycle = compareChoices(choices, ipmiCommand);
// AC cycle "raw 0x3a 0x37"
let cycleCount = 0; //cycle cycleCount
let targetCycle = 3;
const testStartTime = new Date().getTime();
log("Test started ", log_file);
let index = 0;

// Run cycle test
(async () => {
  let isPoweredOff = false;
  let isACCycled = false;
  console.log("Test startTime ", testStartTime);
  log(`-------Loop ${testStartTime} ${cycleCount} -----start`, log_file);

  // fix count with hours later
  while (cycleCount <= targetCycle) {
    let powerCommand = commands[index];

    log(`SUT status ${await systemStatus()} `, log_file);

    // log("[INFO] Send power off ipmi command to system.", log_file);
    // Check if ipmiCycle commands includes AC cycle
    while (isACCycled) {
      pingHost(bmcIp);
    }

    if ((await systemStatus()) === "OSBooted") {
      runIpmiTool(powerCommand);
      console.log(`Sleep 15 seconds --- ${powerCommand}`);
      await sleep(15000);
      if (powerCommand == "raw 0x3a 0x37") {
        isACCycled = true;
      }
    }
    // log(`[INFO] Sleeping 30 seconds to power down. `, log_file);
    console.log(` Sleeping 30 seconds to ${powerCommand}. `);
    await sleep(30000);
    log(`SUT status ${await systemStatus()} `, log_file);
    console.log(`Sut status ${await systemStatus()}`);

    if ((await systemStatus()) == "SystemPowerOff_StateUnknown") {
      isPoweredOff = true;
    } else {
      let waitCount = 1;
      console.log(`Cycle count ${cycleCount}, isPoweredOff ${isPoweredOff}, `);
      // Exit script if system is not powered off in 5 minutes
      while (!isPoweredOff) {
        if (waitCount > 20) {
          log(
            "[Error] Wait for 5 minutes but system is NOT powered off. Script terminated.",
            log_file
          );
          console.log(
            "[Error] Wait for 5 minutes but system is NOT powered off. Script terminated."
          );
          return;
        }
        log(
          "[INFO] Wait for 15 seconds to detect system power state.",
          log_file
        );
        // await new Promise((resolve) => setTimeout(resolve, 15000));
        await sleep(15000);

        if ((await systemStatus()) == "SystemPowerOff_StateUnknown") {
          isPoweredOff = true;
          log("[INFO] Detect system is powered off.", log_file);
        } else {
          log("[INFO] Detect system is NOT powered off", log_file);
        }
        console.log(`Wait count ${waitCount}, isPoweredOff ${isPoweredOff}`);
        waitCount++;
      }
    }

    // const cycleCommands = ["on", "cycle", "reset", "soft", "off"];
    // // Do cycle depending on array index (cycleCommands)
    // while (new Date().getTime() - testStartTime > 600000) {
    // Start cycle test with power on
    // send ipmi power command
    runIpmiTool(powerCommand);
    await sleep(15000);
    console.log(
      `redFish status ${await systemStatus()}, pw command ${powerCommand}`
    );

    // wait for OS to boot to do another cycle
    let waitCountBoot = 1;
    let osBooted = false;
    while (!osBooted) {
      if (waitCountBoot > 12) {
        log(
          "[Error] Wait for 6 minutes but system is NOT up yet. Script terminated.",
          log_file
        );
        console.log(
          "[Error] Wait for 6 minutes but system is NOT up yet. Script terminated."
        );
        return;
      }
      console.log(`Waiting for system to boot. ${await systemStatus()}`);
      log(`Waiting for system to boot. ${await systemStatus()}`, log_file);
      await sleep(30000);
      if ((await systemStatus()) === "OSBooted") {
        osBooted = true;
      }
      waitCountBoot++;
    }
    if (
      powerCommand === "cycle" ||
      powerCommand === "reset" ||
      powerCommand === "soft"
    ) {
      log("[INFO] Wait for 15 seconds to detect system power state.", log_file);
      console.log(
        `[INFO] Wait for 15 seconds to detect system power state, continue with cycle.`
      );
      await sleep(15000);
      console.log("Current system status ", await systemStatus());
    } else if (powerCommand === "on") {
      log("[INFO] Wait for 15 seconds to detect system power state.", log_file);
      console.log(
        `[INFO] Wait for 15 seconds to detect system power state, continue with cycle.`
      );
      await sleep(15000);
      console.log("Current system status ", await systemStatus());
      if ((await systemStatus()) == "OSBooted") {
        index++;
        return;
      } else {
        log(
          "[INFO] Wait for 15 seconds to detect system power state.",
          log_file
        );
        console.log(
          `[INFO] Wait for 15 seconds to detect system power state, continue with cycle.`
        );
        await sleep(15000);
        console.log("Current system status ", await systemStatus());
      }
    }
    {
    }
    //
    if (index === commands.length) {
      index = 0;
    }
    // }

    cycleCount++;
    console.log(
      "Checking system status end of the loop ",
      await systemStatus()
    );
  }
})();

// SystemOn_StartingUEFI
// SystemRunningInUEFI
// BootingOSOrInUndetectedOS
// SystemPowerOff_StateUnknown
// OSBooted
