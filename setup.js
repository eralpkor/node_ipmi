// tester fill SUT info,
const setup = {
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