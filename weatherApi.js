const axios = require("axios");
const dotenv = require("dotenv");

// Configs
dotenv.config();

const API_key = process.env.API_KEY;

exports.currentByLocation = async ({latitude, longitude}, units) => {
    try {
        const result = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_key}&units=${units}`);
        return result.data
    } catch (err) {
        return err.data
    }
};

exports.currentByCityName = async (name, units) => {
    try {
        const result = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_key}&units=${units}`)
        return result.data
    } catch (err) {
        return err.response.data
    }
};

exports.forecastByLocation = async ({latitude, longitude}, units) => {
    try {
        const result = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_key}&units=${units}`);
        return result.data
    } catch (err) {
        return err.data
    }
};

exports.forecastByCityName = async (name, units) => {
    try {
        const result = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_key}&units=${units}`)
        return result.data
    } catch (err) {
        return err.response.data
    }
};