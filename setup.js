// tester fill SUT info,
const setup = {
  // bmcIp: "10.244.17.23",
  // user: "USERID",
  // pass: "Passw0rd123",
  // cipher: "17",
  // hours: "12",
  // log_file: "charlotte_sit43",
  // targetCount: 30,
  ipmiCommand: [
    ["0x00", "0x02", "0x00"],
    ["0x00", "0x02", "0x01"],
    ["0x00", "0x02", "0x02"],
    ["0x00", "0x02", "0x03"],
    // AC Cycle
    // ["0x3a", "0x37", ""],
  ],
};

export default setup;
