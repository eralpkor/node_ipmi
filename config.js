// // const inquirer = require("inquirer");
// import inquirer from "inquirer";
// const prompt = inquirer.createPromptModule();

// const config = () => {
//   return inquirer
//     .prompt([
//       {
//         name: "xcc_ip",
//         type: "input",
//         message: "What's your BMC ip address?",
//       },
//       {
//         name: "xcc_user",
//         type: "input",
//         message: "What's your BMC user name?",
//       },
//       {
//         name: "xcc_pw",
//         type: "input",
//         message: "What's your BMC password?",
//       },
//       {
//         name: "chiper",
//         type: "input",
//         message: "What's SUTs cipher #, eg. 17",
//       },
//       {
//         name: "hours",
//         type: "input",
//         message: "How many hours test will run?",
//       },
//       {
//         name: "options",
//         message: "What type of power cycle would you like to do?",
//         type: "checkbox",
//         choices: ["off/on", "cycle", "reset"],
//         validate: (options) => {
//           if (!options.length) {
//             return "Choose at least one of the above, use space to choose the option";
//           }

//           return true;
//         },
//       },
//       // Edit later for running test cycle
//       // {
//       //   name: "target_cycle",
//       //   type: "input",
//       //   message: "How long do you want to run the test?",
//       //   default: "12",
//       // },
//     ])
//     .then((answer) => {
//       return answer;
//     })
//     .catch((err) => console.log(err));
// };

// export default config;

/// manual config
const xcc_ip = "10.244.16.136";
const xcc_id = "USERID";
const xcc_pw = "Passw0rd123";
const target_cycle = 200;

export default { xcc_ip, xcc_id, xcc_pw, target_cycle };
