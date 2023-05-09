const exec = require("child_process").execFile;
const { config } = require("./config");
const { Commands } = require("./commands");
const sleep = require("./helper");
const Config = require("./config");
const ipmitool = "ipmi/ipmitool.exe";

var date_ob = new Date();
var day = ("0" + date_ob.getDate()).slice(-2);
var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
var year = date_ob.getFullYear();

var date = year + "-" + month + "-" + day;

var hours = date_ob.getHours();
var minutes = date_ob.getMinutes();
var seconds = date_ob.getSeconds();

var dateTime =
  year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

// (async () => {
//   try {
//     const answer = await config();

//   } catch (err) {
//     console.log(err.message);
//   }
// })();

(async () => {
  try {
    const answer = await config();
    // console.log("answers ", answer);
    // if (answer.xcc_ip, answ) {
    console.log("IP address ", answer.xcc_ip);

    const runTest = (answer) => {
      exec(
        ipmitool,
        [
          "-I",
          "lanplus",
          "-H",
          answer.xcc_ip,
          "-U",
          answer.xcc_user,
          "-P",
          answer.target_cycle,
          answer.xcc_pw,
          Commands.power,
          Commands.powerStatus,
          // "power",
          // "status",
        ],
        function (err, data, stdout, stderr) {
          if (err) {
            console.log(err.message);
            return;
          }
          if (data) {
            console.log("Chassis Status: " + data.toString());
          }
          // console.log(`stdout: ${stdout}`);
          // console.error(`stderr: ${stderr}`);
        }
      );
    };
    // }
    runTest(answer);
  } catch (error) {}
})();

// function checkPower() {
//   exec(
//     ipmitool,
//     [
//       "-I",
//       "lanplus",
//       "-H",
//       answer.xcc_ip,
//       "-U",
//       answer.xcc_user,
//       "-P",
//       answer.target_cycle,
//       answer.xcc_pw,
//       Commands.power,
//       Commands.powerStatus,
//       // "power",
//       // "status",
//     ],
//     function (err, data, stdout, stderr) {
//       if (err) {
//         console.log(err.message);
//         return;
//       }
//       if (data) {
//         console.log("Chassis Status: " + data.toString());
//       }
//       // console.log(`stdout: ${stdout}`);
//       // console.error(`stderr: ${stderr}`);
//     }
//   );
// }

async function demo() {
  for (let i = 0; i < 5; i++) {
    console.log(`Waiting 5 seconds...`);
    await sleep(5 * 1000);
    checkPower();
  }
  console.log("Done");
}

// demo();
