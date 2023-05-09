const inquirer = require("inquirer");

const config = () => {
  return inquirer
    .prompt([
      {
        name: "xcc_ip",
        type: "input",
        message: "What's your BMC ip address?",
      },
      {
        name: "xcc_user",
        type: "input",
        message: "What's your BMC user name?",
      },
      {
        name: "xcc_pw",
        type: "input",
        message: "What's your BMC password?",
      },
      {
        name: "target_cycle",
        type: "input",
        message: "How long do you want to run the test?",
        default: "12",
      },
    ])
    .then((answer) => {
      return answer;
    })
    .catch((err) => console.log(err));
};

// const config = require("readline").createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// readline.xcc_ip(`What's your XCC ip address? `, (ip) => {
//   // console.log(`Hi ${name}!`);
//   return ip;
//   readline.close();
// });

// readline();

// module.exports = { Config };
module.exports = config;
config();
