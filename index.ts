import { connect } from "mqtt";
import { totalmem, freemem } from "os";

console.log("Hodor!");

var client  = connect(`mqtt://${process.env.MQTT_ADAPTER_IP}`, {
  username: `${process.env.MY_DEVICE}@${process.env.MY_TENANT}`,
  password: process.env.MY_PWD,
})

client.on('connect', function () {
  client.subscribe('command/+/+/req/#', function (err) {
    if (!err) {
      console.log("sub command/+/+/req/# ok");
    }
  })
});

client.on('message', function (topic, message) {
  // message is Buffer
  const match = topic.match(/command\/\/\/req\/(.*)\/(.*)/);
  if (match === null || !match[1] || !match[2]) {
    return console.log("bad MQTT topic:", topic, message.toString());
  }
  const requestId = match[1];
  const command = match[2];

  const responseTopic = `command///res/${requestId}/200`;
  const ok = (success = true) => client.publish(responseTopic, JSON.stringify({success}));

  switch (command) {
    case "exit":
      setImmediate(() => process.exit(0));
      return ok();
    case "download":
      console.log(`simulate download: ${message.toString()}`);
      const t = setInterval(() => process.stdout.write("."), 10);
      setTimeout(() => {
        clearInterval(t);
        process.stdout.write(" done.\n");
        ok();
      }, 100);
      return;
    case "restart":
      setTimeout(function () {
        process.on("exit", function () {
          require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
          });
        });
        process.exit();
      }, 1000);
      console.log("restarting in 1s...");
      ok();
      return;
    default:
      console.log(`Unknown command: ${command}`);
      return ok(false);
  }
});

setInterval(() => {
  if (!client.connected) return;

  const memory = `${Math.floor(used() * 10000) / 100}%`;
  client.publish("telemetry", JSON.stringify({
    cpu: "HOT!",
    memory,
  }));
}, 1000);

const used = () => (totalmem() - freemem()) / totalmem();

