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

// Variable
const xcc_ip = config.xcc_ip;
const xcc_id = config.xcc_id;
const xcc_pw = config.xcc_pw;
const target_cycle = config.target_cycle;

console.log(config.xcc_ip);


function printing(text, log_file) {
  console.log(text);
  try {
    appendFileSync(`${log_path}\\test.txt`, `Cycle test ${dateTime}\n`);
    console.log(`Log file ${dateTime}\n`);
  } catch (err) {
    console.log("something went wrong", err);
  }
}

printing('XCC_IP: ' + xcc_ip)