const exec = require("child_process").execFile;
// const { Config } = require("./config");
const { Commands } = require("./commands");
const sleep = require("./helper");
const readline = require("./config");
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
// console.log(readline);

function checkPower() {
  exec(
    ipmitool,
    [
      "-I",
      "lanplus",
      "-H",
      Config.xcc_ip,
      "-U",
      Config.xcc_user,
      "-P",
      Config.xcc_pw,
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
}

async function demo() {
  for (let i = 0; i < 5; i++) {
    console.log(`Waiting 5 seconds...`);
    await sleep(5 * 1000);
    checkPower();
  }
  console.log("Done");
}

// demo();
// checkPower();
readline;
