import express, { json } from 'express';
import requestIp from "request-ip";
import { sendGetDataWithAxios, getIpInfo } from './modules/index.js';

import { configDotenv } from "dotenv";

configDotenv();

const app = express();
app.use(json());
app.use(requestIp.mw());

const port = process.env.PORT || 8080;

const accuWeatherAPIKey = process.env.ACCUWEATHER_TOKEN

app.get('/api/hello', async (req, res) => {
    try {

        // console.log(req.clientIp);

        //user's ip address
        const ipAdress = req.clientIp || req.socket.address;

        //get visitor's name
        let { visitor_name } = req?.query || {}

        if (visitor_name) {
            visitor_name = visitor_name?.toString()?.charAt(0)?.toUpperCase() + visitor_name?.slice(1);
        }

        //get user's location
        const { city, country } = await getIpInfo(ipAdress)

        // console.log(city, country)

        const locationKeyResponse = await sendGetDataWithAxios('http://dataservice.accuweather.com/locations/v1/cities/ipaddress', {
            q: ipAdress,
            apikey: accuWeatherAPIKey
        }, {
            'Content-Type': 'application/json'
        })

        //destructure key
        const { Key } = locationKeyResponse || {}

        const weatherResponse = await sendGetDataWithAxios(`http://dataservice.accuweather.com/currentconditions/v1/${Key}`, {
            apikey: accuWeatherAPIKey
        }, {
            'Content-Type': 'application/json'
        });

        const { Temperature } = weatherResponse?.[0] || {}

        // console.log(Temperature);

        const locationTemperature = Temperature?.Metric?.Value || "0";
        
        return res.status(200).json({
            client_ip: ipAdress,
            location: city,
            greeting: `Hello, ${visitor_name || "Guest"}!, the temperature is ${locationTemperature} degrees Celcius in ${city}`
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

app.listen(port, () => {
    console.log('Server is running on port 5000');
})