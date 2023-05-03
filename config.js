// xcc_ip = "10.244.16.224";

// const Config = {
//   xcc_ip: "10.244.16.124",
//   xcc_user: "USERID",
//   xcc_pw: "Passw0rd123",
//   target_cycle: 200,
// };

const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(`What's your name?`, (name) => {
  console.log(`Hi ${name}!`);
  readline.close();
});

// readline();

// module.exports = { Config };
module.exports = rl;
