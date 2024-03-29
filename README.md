# Node.js ipmi script

### Intelligent Platform Management Interface (IPMI)

### This script allows you to power cycle a system with ipmi commands

## Usage

You need to have [node.js](https://nodejs.org/en/), ipmitool for Windows OS and npm installed on your computer

node powerCycle.js [options] -u <username> -p <password> -i <bmc ip address> -c <cipher> -t <hours> -l <log file> --help <display help for command>

````$ node runTestRedfish.js -h
Usage: runTestRedfish [OPTIONS]...

Options:
-v, --version output the version number
-u, --user <USERID> BMC user name
-p, --password <PasswOrd> BMC password
-i, --ip <IP ADDRESS> BMC ip address
-c, --cipher <CIPHER> cipher number, eg. 17
-t, --time <HOURS> hours for test to run
-l, --log <LOG_FILE_NAME> name of the log file
-h, --help display help for command ```

## License

This project is licensed under the MIT License.
````
