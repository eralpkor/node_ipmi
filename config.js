// const inquirer = require("inquirer");
import inquirer from "inquirer";
const prompt = inquirer.createPromptModule();

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
        name: "chiper",
        type: "input",
        message: "What's SUTs cipher #, eg. 17",
      },
      {
        name: "hours",
        type: "input",
        message: "How many hours test will run?",
      },
      {
        name: "options",
        message: "What type of power cycle would you like to do?",
        type: "checkbox",
        choices: ["on", "off", "cycle", "reset"],
        validate: (options) => {
          if (!options.length) {
            return "Choose at least one of the above, use space to choose the option";
          }

          return true;
        },
      },
      // Edit later for running test cycle
      // {
      //   name: "target_cycle",
      //   type: "input",
      //   message: "How long do you want to run the test?",
      //   default: "12",
      // },
    ])
    .then((answer) => {
      return answer;
    })
    .catch((err) => console.log(err));
};

// module.exports = { config };
export default config;
