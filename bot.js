const database = require("./database");
const Telegraf = require("telegraf");
const dotenv = require("dotenv");
const app = require("./app");
const express = require("express");
const path = require("path");
const I18n = require("telegraf-i18n/lib/i18n");
const {getUser} = require("./user/userController");
const utils = require("./utils");

// Configs
dotenv.config();

// Connect to database
database.connect();

// i18n options
const i18n = new I18n({
  directory: path.resolve(__dirname, "locales"),
  defaultLanguage: "en",
  sessionName: "session",
  useSession: true,
  templateData: {
    pluralize: I18n.pluralize,
    uppercase: value => value.toUpperCase()
  }
});

// Initialising bot object
const TOKEN = process.env.TOKEN;
const bot = new Telegraf(TOKEN);
const DYNO_URL = process.env.DYNO_URL

utils.wakeUpDyno(DYNO_URL)

// Middlewares
bot.use(Telegraf.session());
bot.use(i18n.middleware());

// Handlers
bot.start(ctx => app.start(ctx));

bot.on("location", ctx => app.location_handler(ctx))

bot.hears('/alert', ctx => app.notification(ctx))

bot.on("message", async ctx => {
  ctx.session.user = ctx.session.user || (await getUser(ctx.from.id));

  if (ctx.session.user === null) app.start(ctx);
  else if (ctx.session.user.state.menu === "language") app.language_menu(ctx);
  else if (ctx.session.user.state.menu === "main") app.main_menu(ctx);
  else if (ctx.session.user.state.menu === "currentWeather") app.currentWeather_menu(ctx);
  else if (ctx.session.user.state.menu === "forecastWeatherCity") app.forecastWeatherCity_menu(ctx);
  else if (ctx.session.user.state.menu === "forecastWeatherDay") app.forecastWeatherDay_menu(ctx);
  else if (ctx.session.user.state.menu === "turnOnNotification") app.turnOnNotification_menu(ctx);
  else if (ctx.session.user.state.menu === "settings") app.settings_menu(ctx);
})

// Launch the bot
// bot.launch();

// Set telegram webhook

bot.telegram.setWebhook(DYNO_URL);

const expressApp = express();
expressApp.get("/", (req, res) => res.send("Hello World!"));
// Set the bot API endpoint
expressApp.use(bot.webhookCallback("/bot"));
expressApp.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.PORT || 3000}!`);
});
