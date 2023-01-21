const QRcode = require("qrcode-terminal");
const {
  Client,
  Buttons,
  LocalAuth,
  MessageMedia,
} = require("whatsapp-web.js");
const { createCanvas, Image, registerFont } = require("canvas");
const fs = require("fs");
const QRCode = require('qrcode');

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
  debug.info('[MESSAGE]', msg.from, '->', msg.body);

  if (msg.body.startsWith("!CNY")) {
    let content = msg.body.substring(5);
    createImage(content);
    let media = await MessageMedia.fromFilePath("./message1.png");
    await client.sendMessage(msg.from, media);
    debug.info('[MSG CARD SENT] ->',content);
    return;
  }
  else if (msg.body.startsWith("!QR")) {
    let content = msg.body.substring(4);
    createAngpow(content);
    let media = await MessageMedia.fromFilePath("./angpow1.png");
    await client.sendMessage(msg.from, media);
    debug.info('[QR CARD SENT] ->',content);
    return;
  }

  if (msg.body.includes("CNY")) {
    debug.info('[STARTING] ->', msg.from);
    let starting = new Buttons(
      "🙌 Thank you for checking out this bot. You can create a custom message card using this bot, or even send a customize card with QR code using this bot! Simply click an option below to get started.",
      [
        { body: "🎉 Create a custom message card.", id: "start-custom" },
        { body: "💸 Create a message card with QR code.", id: "start-angpow" },
        { body: "🤖 I want to host my own bot!", id: "start-host" }
      ],
      "👋 Hello! 新年快乐",
      "Select an option below to continue"
    );
    client.sendMessage(msg.from, starting);
    responses[msg.from] = 'starting';
    return;
  }

  if (msg.selectedButtonId == 'start-custom') {
    client.sendMessage(msg.from, '*Send a message card*\n\nType in the message below and the bot will create you a custom message card. Recommended to be within 1 line of words (20 Chinese characters or 40 English characters).');
    debug.info('[MSG CARD]');
    responses[msg.from] = 'message';
    return;
  }
  else if (msg.selectedButtonId == 'start-angpow') {
    client.sendMessage(msg.from, '*Send a QR code message card*\n\nSend me the link of your QR code.');
    debug.info('[QR CARD]');
    responses[msg.from] = 'angpow';
    return;
  }
  else if (msg.selectedButtonId == 'start-host') {
    client.sendMessage(msg.from, '*Host your own Whatsapp bot*\n\nDont worry! This bot is totally open-sourced! The code is at: https://github.com/hongvin/cny-bot! Give me a star if you found it useful!');
    debug.info('[SELF-HOST]');
    responses[msg.from] = 'none';
    return;
  }

  else if (responses[msg.from] == 'message') {
    createImage(msg.body);
    let media = await MessageMedia.fromFilePath("./message1.png");
    await client.sendMessage(msg.from, media);
    client.sendMessage(msg.from, 'Here you go! Just simply invoke me by sending *CNY* again. Or, just use *!CNY <message>* to create it seamlessly!');
    debug.info('[MSG CARD SENT] ->',msg.body);
    responses[msg.from] = 'none';
    return;
  }

  else if (responses[msg.from] == 'angpow') {
    createAngpow(msg.body);
    let media = await MessageMedia.fromFilePath("./angpow1.png");
    await client.sendMessage(msg.from, media);
    client.sendMessage(msg.from, 'Here you go! Just simply invoke me by sending *CNY* again. Or, just use *!QR <link>* to create it seamlessly!');
    debug.info('[QR CARD SENT] ->',msg.body);
    responses[msg.from] = 'none';
    return;
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
  img.src = "./assets/message.png";
  fs.writeFileSync(`./message1.png`, imageCanvas.toBuffer("image/png"));
}

function createAngpow(link) {
  let imageCanvas = createCanvas(1000, 1000);
  let qrCanvas = createCanvas(335, 335);
  let context = imageCanvas.getContext("2d");
  let img = new Image();

  QRCode.toCanvas(qrCanvas, link, {
    width: 335,
    margin: 2,
    color: {
      dark: '#C30010',
      light: '#0000'
    }
  }, function (error) {
    if (error) debug.error('[QRCODE] ->', error)
    debug.log('[QRCODE] -> Generated for link', link);
  })


  img.onload = function () {
    context.drawImage(img, 0, 0);
    context.drawImage(qrCanvas, 328, 158);
  };
  img.src = "./assets/angpow.png";
  fs.writeFileSync(`./angpow1.png`, imageCanvas.toBuffer("image/png"));
}