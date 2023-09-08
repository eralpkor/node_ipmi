import ping from "ping";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const frequency = 5000;

const pingHost = async (host) => {
  // hosts.forEach(function (host) {
  setInterval(() => {
    ping.sys.probe(host, function (isAlive) {
      var msg = isAlive
        ? "host " + host + " is alive"
        : "host " + host + " is dead";
      console.log(isAlive);
      return isAlive;
    });
  }, frequency);
  // });
};

export { sleep, pingHost };
