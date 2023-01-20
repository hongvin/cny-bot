const QRcode = require("qrcode-terminal");
const {
  Client,
  Buttons,
  LocalAuth,
  MessageMedia,
} = require("whatsapp-web.js");
const { createCanvas, Image, registerFont } = require("canvas");
const fs = require("fs");

const log4js = require("log4js");

log4js.configure({
  appenders: {
    console: { type: "console" },
    log: { type: "file", filename: "cnyBot.log" },
  },
  categories: {
    default: { appenders: ["log", "console"], level: "debug" },
  },
});
const debug = log4js.getLogger("default");


registerFont("./assets/SofiaSans-Black.ttf", { family: "Sofia Sans" });
registerFont("./assets/YRDZST.ttf", { family: "YRDZST" });


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
    executablePath:
      "/usr/bin/google-chrome",
  },
});

let responses = {};

client.initialize();

client.on("loading_screen", (percent, message) => {
  debug.info("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  QRcode.generate(qr, { small: true });
  debug.info("QR RECEIVED", qr);
});

client.on("authenticated", () => {
  debug.info("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  debug.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  debug.info("READY");
});

client.on("message", async (msg) => {
  debug.info('MESSAGE FROM',msg.from,'->',msg.body);

  if (msg.body.includes("CNY")) {
    debug.info('[STARTING] ->',msg.from);
    let starting = new Buttons(
      "🙌 Thank you for checking out this bot. You can create a custom message card using this bot, or even send a customize angpow using this bot! Simply click an option below to get started.",
      [
        { body: "🎉 Create a custom message card.", id: "start-custom" }
        // { body: "💸 Create TnG Angpow message card.", id: "start-angpow" }
      ],
      "👋 Hello! 新年快乐",
      "Select an option below to continue"
    );
    client.sendMessage(msg.from, starting);
    responses[msg.from] = 'starting';
    return;
  }

  if (msg.selectedButtonId=='start-custom'){
    client.sendMessage(msg.from,'*Send a message card*\n\nType in the message below and the bot will create you a custom message card. Recommended to be within 1 line of words (20 Chinese characters or 40 English characters).');
    responses[msg.from] = 'message';
    console.log(responses);
    return;
  }
  if (msg.selectedButtonId=='start-angpow'){
    client.sendMessage(msg.from,'*Send a TnG Angpow message card*\n\nSend me the angpow link.');
    responses[msg.from] = 'angpow';
    return;
  }

  if(responses[msg.from] == 'message'){
    createImage(msg.body);
    let media = await MessageMedia.fromFilePath("./message1.png");
    await client.sendMessage(msg.from, media);
  }

  if(msg.selectedButtonId =='' && responses[msg.from] == 'angpow'){
    createAngpow(msg.body);
    let media = await MessageMedia.fromFilePath("./message1.png");
    await client.sendMessage(msg.from, media);
  }


});

client.on("message_ack", (msg, ack) => {

  if (ack == 3) {
    // The message was read
  }
});

client.on("change_state", (state) => {
  debug.info("CHANGE STATE", state);
});

client.on("disconnected", (reason) => {
  debug.warn("Client was logged out", reason);
});

function createImage(message) {
  let imageCanvas = createCanvas(1000, 1000);
  let context = imageCanvas.getContext("2d");
  let img = new Image();

  img.onload = function () {
    context.drawImage(img, 0, 0);
    context.font = "bold 35pt Sofia Sans";
    context.fillText(message, 100, 395);
  };
  img.src = "./message.png";
  fs.writeFileSync(`./message1.png`, imageCanvas.toBuffer("image/png"));
}

function createAngpow(message) {
  let imageCanvas = createCanvas(1000, 1000);
  let context = imageCanvas.getContext("2d");
  let img = new Image();
  let regExp = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;

  img.onload = function () {
    context.drawImage(img, 0, 0);
    if(regExp.test(message)){
      context.font = "bold 35pt YRDZST";
    }
    else{
    context.font = "bold 35pt Sofia Sans";
    }
    context.fillText(message, 100, 395);
  };
  img.src = "./message.png";
  fs.writeFileSync(`./message1.png`, imageCanvas.toBuffer("image/png"));
}