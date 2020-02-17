const {transliterate} = require('./utils');
const keyboards = require("./keyboards");
const {createUser, getUser, updateUser, getUsers} = require("./user/userController");
const {currentByLocation, currentByCityName, forecastByLocation, forecastByCityName} = require("./weatherApi");

exports.start = async ({reply, i18n, session, from}) => {
    session.user = session.user || (await getUser(from.id));

    if (!session.user || session.user.state.menu === "language") {
        let user = {
            id: from.id,
            name: from.first_name,
            username: from.username || null,
            state: {menu: "language"},
            units: 'metric',
            recentCities: []
        };

        session.user = user;
        await createUser(user);
        i18n.locale("en");

        return reply(i18n.t("chooseLanguage"), keyboards.language_keyboard(i18n));
    } else {
        i18n.locale(session.user.language);

        session.user.state.menu = "main";
        session.user.state.city = "";
        updateUser(session.user);

        return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
    }
};


exports.language_menu = async ({reply, i18n, session, message}) => {
    if (message.text === i18n.t("russian")) session.user.language = "ru";
    else if (message.text === i18n.t("uzbek")) session.user.language = "uz";
    else if (message.text === i18n.t("english")) session.user.language = "en";
    else return reply(i18n.t("chooseLanguage"), keyboards.language_keyboard(i18n));

    i18n.locale(session.user.language);

    session.user.state.menu = "main";
    updateUser(session.user);

    return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
};


exports.main_menu = async ({reply, i18n, message, session}) => {
    i18n.locale(session.user.language);

    if (message.text === i18n.t("settings")) {
        session.user.state.menu = 'settings';

        updateUser(session.user);

        return reply(i18n.t('chooseSetting'), keyboards.settings_keyboard(i18n))
    } else if (message.text === i18n.t("currentWeather")) {
        session.user.state.menu = 'currentWeather';

        updateUser(session.user);

        return reply(i18n.t('chooseCity'), keyboards.weather_keyboard(i18n, session.user.recentCities))
    } else if (message.text === i18n.t("forecastWeather")) {
        session.user.state.menu = 'forecastWeatherCity';

        updateUser(session.user);

        return reply(i18n.t('chooseCity'), keyboards.weather_keyboard(i18n, session.user.recentCities))
    } else {
        return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
    }
};


exports.settings_menu = async ({reply, i18n, message, session}) => {
    i18n.locale(session.user.language);

    if (message.text === i18n.t("back")) {
        session.user.state.menu = "main";
        updateUser(session.user);

        return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
    } else if (message.text === i18n.t("changeLanguage")) {
        session.user.state.menu = "language";
        updateUser(session.user);

        return reply(i18n.t("chooseLanguage"), keyboards.language_keyboard(i18n));
    }
};


exports.currentWeather_menu = async ({reply, i18n, message, session}) => {
    i18n.locale(session.user.language);

    if (message.text === i18n.t("back")) {
        session.user.state.menu = "main";
        updateUser(session.user);

        return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
    } else {
        const current = await currentByCityName(transliterate(message.text), session.user.units);
        console.log(current)
        if (`${current.cod}` === '200') {
            const date = new Date()
            const weekday = `${date.getDay()}`;

            let answer = i18n.t('currentTemplate', {
                i18n: i18n,
                name: current.name,
                weekday: i18n.t(weekday),
                hour: date.getHours(),
                description: i18n.t(`${current.weather[0].description}`),
                temperature: current.main.temp,
                units: i18n.t(`${session.user.units}`),
                cloud: current.clouds.all,
                humidity: current.main.humidity,
                wind: current.wind.speed
            });

            if (session.user.recentCities.length === 0) {
                session.user.recentCities.push(current.name);
            } else if (!session.user.recentCities.includes(current.name)) {
                session.user.recentCities.push(current.name);
            }

            // if (!session.user.notification && session.user.recentCities.length === 1) {
            //     session.user.state.menu = "turnOnNotification";
            //     session.user.state.city = current.name;
            //     updateUser(session.user);
            //
            //     reply(answer)
            //     return reply(i18n.t('turnOnNotification', {city: current.name}), keyboards.turnOnNotification_keyboard(i18n))
            // }

            session.user.state.menu = 'main';
            updateUser(session.user);

            return reply(answer, keyboards.main_keyboard(i18n))
        } else if (`${current.cod}` === '404') {
            let answer = i18n.t(current.message);
            return reply(answer, keyboards.weather_keyboard(i18n, session.user.recentCities))
        }
    }
};


exports.forecastWeatherCity_menu = async ({reply, i18n, message, session}) => {
    i18n.locale(session.user.language);

    if (message.text === i18n.t("back")) {
        session.user.state.menu = "main";
        updateUser(session.user);

        return reply(i18n.t("begin"), keyboards.main_keyboard(i18n));
    } else {
        const forecast = await forecastByCityName(transliterate(message.text), session.user.units);

        if (`${forecast.cod}` === '200') {
            let answer = i18n.t('chooseWeekday', {city: forecast.city.name});

            session.user.state.menu = 'forecastWeatherDay'
            session.user.state.city = forecast.city.name
            updateUser(session.user);

            return reply(answer, keyboards.forecastDays_keyboard(i18n, forecast.list))
        } else if (`${forecast.cod}` === '404') {
            let answer = i18n.t(forecast.message);
            return reply(answer, keyboards.weather_keyboard(i18n, session.user.recentCities))
        }
    }
};


exports.forecastWeatherDay_menu = async ({reply, i18n, message, session}) => {
    i18n.locale(session.user.language);

    if (message.text === i18n.t("back")) {
        session.user.state.menu = 'forecastWeatherCity';

        updateUser(session.user);

        return reply(i18n.t('chooseCity'), keyboards.weather_keyboard(i18n, session.user.recentCities))
    } else {
        const forecast = await forecastByCityName(session.user.state.city, session.user.units);

        if (`${forecast.cod}` === '200') {
            let answer = `🌆 ${forecast.city.name}\n🗓 ${message.text.split(' ')[0]}\n\n`;

            for (let i in forecast.list) {
                let date = new Date(`${forecast.list[i].dt_txt}`);
                let weekday = `${i18n.t(`${date.getDay()}`)}`;
                let hour = date.getHours()

                if (message.text.split(' ')[0] === weekday && (hour === 6 || hour === 12 || hour === 18)) {

                    answer += `${i18n.t('forecastTemplate', {
                        i18n: i18n,
                        hour,
                        date: `${("0" + date.getDate()).slice(-2)}.${("0" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`,
                        description: i18n.t(`${forecast.list[i].weather[0].description}`),
                        temperature: forecast.list[i].main.temp,
                        units: i18n.t(`${session.user.units}`),
                        cloud: forecast.list[i].clouds.all,
                        humidity: forecast.list[i].main.humidity,
                        wind: forecast.list[i].wind.speed
                    })}\n\n`
                }
            }

            return reply(answer)
        } else if (`${forecast.cod}` === '404') {
            let answer = i18n.t(forecast.message);
            return reply(answer, keyboards.weather_keyboard(i18n, session.user.recentCities))
        }
    }
};


exports.turnOnNotification_menu = async ({reply, i18n, message, session}) => {
    if (message.text === i18n.t("yes")) {
        session.user.notificationsCity = session.user.state.city
        session.user.notification = true
        session.user.state.city = ''
        session.user.state.menu = 'main'
        updateUser(session.user)

        return reply(i18n.t('notificationTurnedOn', {city: session.user.notificationsCity}), keyboards.main_keyboard(i18n))
    } else if (message.text === i18n.t("no")) {
        session.user.state.menu = 'main'
        updateUser(session.user)

        return reply(i18n.t('begin'), keyboards.main_keyboard(i18n))
    }
}


exports.location_handler = async ({reply, i18n, message, session, from}) => {
    session.user = session.user || await getUser(from.id);
    i18n.locale(session.user.language);

    if (session.user.state.menu === "currentWeather") {
        const current = await currentByLocation(message.location, session.user.units);

        if (`${current.cod}` === '200') {
            const date = new Date();
            const weekday = `${date.getDay()}`;

            let answer = i18n.t('currentTemplate', {
                i18n: i18n,
                name: current.name,
                weekday: i18n.t(weekday),
                hour: date.getHours(),
                description: i18n.t(`${current.weather[0].description}`),
                temperature: current.main.temp,
                units: i18n.t(`${session.user.units}`),
                cloud: current.clouds.all,
                humidity: current.main.humidity,
                wind: current.wind.speed
            });

            session.user.state.menu = 'main';

            if (session.user.recentCities.length === 0) {
                session.user.recentCities.push(current.name);
            } else if (!session.user.recentCities.includes(current.name)) {
                session.user.recentCities.push(current.name);
            }
            updateUser(session.user);

            return reply(answer, keyboards.main_keyboard(i18n))
        } else if (`${current.cod}` === '404') {
            let answer = i18n.t(current.message);
            return reply(answer, keyboards.weather_keyboard(i18n, session.user.recentCities))
        }

    } else if (session.user.state.menu === "forecastWeatherCity") {
        const forecast = await forecastByLocation(message.location, session.user.units);

        if (`${forecast.cod}` === '200') {
            let answer = i18n.t('chooseWeekday', {city: forecast.city.name});

            session.user.state.menu = 'forecastWeatherDay'
            session.user.state.city = forecast.city.name
            updateUser(session.user);

            return reply(answer, keyboards.forecastDays_keyboard(i18n, forecast.list))
        } else if (`${forecast.cod}` === '404') {
            let answer = i18n.t(forecast.message);
            return reply(answer, keyboards.weather_keyboard(i18n, session.user.recentCities))
        }
    }
};


exports.notification = async ({i18n, telegram}) => {
    const users = await getUsers();

    for (let j in users) {
        const forecast = await forecastByCityName(users[j].notificationsCity, users[j].units);
        i18n.locale(users[j].language)

        if (`${forecast.cod}` === '200') {
            let now = new Date()
            let answer = `🌆 ${forecast.city.name}\n🗓 ${i18n.t(`${now.getDay()}`)}\n\n`;

            for (let i in forecast.list) {
                let date = new Date(`${forecast.list[i].dt_txt}`);
                let weekday = `${i18n.t(`${date.getDay()}`)}`;

                if (`${i18n.t(`${now.getDay()}`)}` === weekday && (date.getHours() === 6 || date.getHours() === 12 || date.getHours() === 18)) {

                    answer += `${i18n.t('forecastTemplate', {
                        i18n: i18n,
                        hour: date.getHours(),
                        date: `${("0" + date.getDate()).slice(-2)}.${("0" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`,
                        description: i18n.t(`${forecast.list[i].weather[0].description}`),
                        temperature: forecast.list[i].main.temp,
                        units: i18n.t(`${users[j].units}`),
                        cloud: forecast.list[i].clouds.all,
                        humidity: forecast.list[i].main.humidity,
                        wind: forecast.list[i].wind.speed
                    })}\n\n`
                }
            }

            telegram.sendMessage(users[j].id, answer, keyboards.main_keyboard(i18n))
        }
    }
}