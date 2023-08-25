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
// replace running log from the answers config file name
const log_file = log_path + "/RunningLog_" + ".txt";
import log from "log-to-file";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Temp variables
const user = "USERID";
const pass = "Passw0rd123";
const bmcIp = "10.244.16.136";
const cypher = "17";
const ipmiCommand = "status";

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
      // answer.chiper,
      cypher,
      "-H",
      bmcIp,
      // answer.xcc_ip,
      "-U",
      user,
      // answer.xcc_user,
      "-P",
      // answer.xcc_pw,
      pass,
      // commands.power,
      // commands.powerStatus,
      // answer.options,
      "power",
      // "status",
      answer,
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

const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function systemStatus() {
  return axios
    .get(`https://10.244.16.136/redfish/v1/Systems/1`, {
      httpsAgent: agent,
      auth: {
        username: "USERID",
        password: "Passw0rd123",
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

const cycleCommands = ["on", "off", "cycle", "reset", "soft"];
let cycleCount = 0; //cycle cycleCount
let targetCycle = 3;
const testStartTime = new Date().getTime();
log("Test started ", log_file);

(async () => {
  // start loop with power cycle
  while (cycleCount <= targetCycle) {
    let index = 0;

    console.log("Test startTime ", testStartTime);
    log(`-------Loop ${testStartTime} ${cycleCount} -----start`, log_file);
    log(`SUT status ${systemStatus()} `, log_file);
    log("[INFO] Send power off ipmi command to system.", log_file);
    // Power off system ipmi
    runIpmiTool("off");
    let isPoweredOff = false;
    let waitCount = 1;

    while (!isPoweredOff) {
      if (waitCount > 12) {
        log(
          "[Error] Wait for 5 minutes but system is NOT powered off. Script terminated.",
          log_file
        );
        console.log(
          "[Error] Wait for 5 minutes but system is NOT powered off. Script terminated."
        );
        return;
      }
      log("[INFO] Wait for 15 seconds to detect system power state.", log_file);
      // await new Promise((resolve) => setTimeout(resolve, 15000));
      await sleep(15000);
      if (await systemStatus()) {
      }
    }
    // Do cycle depending on array index (cycleCommands)
    if ((await systemStatus()) == "OSBooted") {
      for (const i of cycleCommands) {
      }

      index++;
      console.log("index number ", index);
      // console.log("System status... ", await systemStatus());
      log(`System status ${await systemStatus()}`, log_file);
      console.log("Waiting 30 seconds to shut down the system...");
      await new Promise((resolve) => setTimeout(resolve, 30000));
      // send IPMI command to shutdown SUT, index = power command
      runIpmiTool(cycleCommands[index]);
      console.log("Sleep 30 secs to check system status");
      await new Promise((resolve) => setTimeout(resolve, 30000));
      // const await systemStatus() = await systemStatus();

      // console.log("System status.. await... ", await systemStatus());
      console.log("cycleCount ", cycleCount);
      log(`System status...  ${await systemStatus()}`, log_file);
      log(`Power commands ${cycleCommands[index]}`, log_file);
      // return await systemStatus();
    }
    console.log("Sleeping 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await systemStatus();

    // turn on the system
    if ((await systemStatus()) == "SystemPowerOff_StateUnknown") {
      console.log(
        "Sleeping 5 seconds to power on system...",
        await systemStatus()
      );
      // sleep 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));
      runIpmiTool("on");
    }
    // Check status until system is fully booted in to the OS
    // Fix loop
    // Stop the test if system stuck on boot or something else.
    while (
      (await systemStatus()) !== "OSBooted"
      // ||"SystemPowerOff_StateUnknown"
    ) {
      let startTime = new Date().getTime();
      console.log("What is date? Beginning of loop ", startTime);

      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log(
        "System status, waiting for system to boot... ",
        await systemStatus()
      );
      log(`System status ${await systemStatus()}`, log_file);
      console.log(
        "Test been running, time: ",
        new Date().getTime() - startTime
      );
      // Sleep 10 minutes, if SUT doesn't boot exit the script.
      if (new Date().getTime() - startTime > 600000) {
        console.log(
          "Cannot continue to test, no response from server, waited for 10 minutes ",
          await systemStatus()
        );
        log(
          `'[-----] Script terminated.', waited for 10 minutes ${await systemStatus()} `,
          log_file
        );
        // Add FFDC collection
        console.log("Collecting FFDC data... ");

        return;
      }
      startTime = new Date().getTime();
      console.log("What is date? End of loop ", startTime);
      // return await systemStatus();
    }

    cycleCount++;
    console.log(
      "Checking system status end of while loop ",
      await systemStatus()
    );
    // return await systemStatus();
  }
})();

// SystemOn_StartingUEFI
// SystemRunningInUEFI
// BootingOSOrInUndetectedOS
// SystemPowerOff_StateUnknown
