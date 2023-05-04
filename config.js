// xcc_ip = "10.244.16.224";

// const Config = {
//   xcc_ip: "10.244.16.124",
//   xcc_user: "USERID",
//   xcc_pw: "Passw0rd123",
//   target_cycle: 200,
// };

const config = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.xcc_ip(`What's your XCC ip address? `, (ip) => {
  // console.log(`Hi ${name}!`);
  return ip;
  readline.close();
});

// readline();

// module.exports = { Config };
module.exports = config;
