import { execFile } from "node:child_process";
import path from "node:path";
import { appendFileSync } from "node:fs";
import config from "./config.js";
import dateTime from "./date.js";
import commands from "./commands.js";
import sleep from "./helper.js";
const ipmi_path = path.dirname("C:\\node_ipmi\\ipmi\\ipmitool.exe");
const log_path = path.dirname("C:\\node_ipmi\\logs\\test");

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
    const j = 3;
    for (let i = 0; i < 3; i++) {
      let powerOptions = answer.options[i];
      runIpmiTool(answer);
      // give time for console log
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("running ", i);
    }
    // runIpmiTool(answer);
    // return runIpmiTool(answer);
  } catch (error) {
    console.log("Something went wrong: ", error);
  }
  console.log("End ");
}

// Where to use cycle numbers / hours
// answer.target_cycle,

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
        console.log("Chassis Status: " + data.toString());
        // console.log(`stdout: ${stdout}`);
      }
      // console.log(`stdout: ${stdout}`);
    }
  );
};

export default ipmiCommand;

// 1. Execute script
// 2. Get tester to put test info
// 3. Handle IPMI options:  -I, -H, -U. -P, and IPMI commands
// 4. Handle test, eg. cycle type "power on, off, cycle, reset, status"
// 5. Handle test duration
// 6. Test log file name
// 7. System name to keep track
// 8. Output to log file all
// 9. Output to the screen
// 10. Error handling
// 11. Use RedFish to check SUT

// const date_ob = new Date();
// const day = ("0" + date_ob.getDate()).slice(-2);
// const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
// const year = date_ob.getFullYear();

// const date = year + "-" + month + "-" + day;

// const hours = date_ob.getHours();
// const minutes = date_ob.getMinutes();
// const seconds = date_ob.getSeconds();

// const dateTime =
//   year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
