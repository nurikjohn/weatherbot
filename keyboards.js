const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const {listToMatrix} = require('./utils');


exports.language_keyboard = i18n => {
    return Markup.keyboard([[i18n.t("english")], [i18n.t("russian")], [i18n.t("uzbek")]])
        .resize()
        .extra();
};


exports.main_keyboard = i18n => {
    return Markup.keyboard([[i18n.t("currentWeather")], [i18n.t("forecastWeather")], [i18n.t("settings")]])
        .resize()
        .extra();
};


exports.weather_keyboard = (i18n, recent) => {
    return Extra.markup(markup => {
        let buttons = [];

        for (i in recent) {
            buttons.push(recent[i]);
        }

        buttons.push(
            markup.locationRequestButton(i18n.t("location")),
            markup.button(i18n.t("back")));

        return markup.resize().keyboard(buttons)
    })
};


exports.forecastDays_keyboard = (i18n, forecast) => {
    return Extra.markup(markup => {
        let buttons = [];
        let weekdays = [];

        for (let i in forecast) {
            let date = new Date(forecast[i].dt_txt);
            let weekday = `${i18n.t(`${date.getDay()}`)} ${i18n.t(forecast[i].weather[0].icon.replace('n', 'd'))}`;
            if (!weekdays.includes(date.getDay()) && (date.getHours() === 6 || date.getHours() === 12 || date.getHours() === 18)){
                buttons.push(weekday);
                weekdays.push(date.getDay())
            }
        }

        buttons = listToMatrix(buttons, 2);

        buttons.push([markup.button(i18n.t("back"))]);

        return markup.resize().keyboard(buttons)
    })
};


exports.turnOnNotification_keyboard = i18n => {
    return Markup.keyboard([[i18n.t("no"), i18n.t("yes")]])
        .resize()
        .extra();
};


exports.settings_keyboard = i18n => {
    return Markup.keyboard([[i18n.t("changeLanguage")], [i18n.t("back")]])
        .resize()
        .extra();
};