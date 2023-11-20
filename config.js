// const inquirer = require("inquirer");
import inquirer from "inquirer";
// const prompt = inquirer.createPromptModule();

const config = () => {
  return inquirer
    .prompt([
      {
        name: "xccIp",
        type: "input",
        message: "What's your BMC ip address?",
      },
      {
        name: "xccUser",
        type: "input",
        message: "What's your BMC user name?",
      },
      {
        name: "xccPw",
        type: "input",
        message: "What's your BMC password?",
      },
      {
        name: "cypher",
        type: "input",
        message: "What's SUTs cipher #, eg. 17",
      },
      {
        name: "hours",
        type: "input",
        message: "How many hours test will run?",
        default: "12",
      },
      {
        name: "log_file",
        type: "input",
        message: "Log file name (no need to put .log)",
      },
      // Maybe, ask user for current SUT status to start cycle on/off
      {
        name: "startOptions",
        type: "confirm",
        message: "Is system ON (Y/n)?",
        default: true,
      },
      {
        name: "startOption",
        type: "checkbox",
        message: "Current SUT status? ON/OFF",
        choices: ["on", "off"],
        validate: (options) => {
          if (!options.length) {
            return "Choose at least one of the above, use space to choose the option";
          }

          return true;
        },
      },
      {
        name: "cycleOptions",
        message: "What type of power cycle would you like to do?",
        type: "checkbox",
        choices: ["off", "on", "cycle", "reset", "AC cycle"],
        validate: (options) => {
          if (!options.length) {
            return "Choose at least one of the above, use space to choose the option";
          }

          return true;
        },
      },
      {
        name: "targetCount",
        type: "input",
        message: "How many loops do you want to run?",
        default: "12",
      },
    ])
    .then((answer) => {
      return answer;
    })
    .catch((err) => console.log(err));
};

export default config;
