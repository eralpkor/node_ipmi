// tester fill SUT info,
const setup = {
  ipmiCommand: [
    // ["0x00", "0x02", "0x00", "power off"],
    ["0x00", "0x02", "0x01", "power on"],
    // ["0x00", "0x02", "0x02", "power cycle"],
    // ["0x00", "0x02", "0x03", "power reset"],
    // AC Cycle
    ["0x3a", "0x37", "", "AC cycle"],
  ],
};

export default setup;
