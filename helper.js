import ping from "ping";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pingHost = async (host) => {
  let res = await ping.promise.probe(host);
  return res.alive;
};

// Time stamp
const timeStamp = async () => {
  const date_ob = new Date();
  const day = ("0" + date_ob.getDate()).slice(-2);
  const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  const year = date_ob.getFullYear();

  const date = year + "-" + month + "-" + day;

  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  const dateTime =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return dateTime;
};

export { sleep, pingHost, timeStamp };
