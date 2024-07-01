import { IPinfoWrapper } from "node-ipinfo";
import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv();

function sendGetDataWithAxios(url, data, headers) {

    // Append the data to the URL as query parameters
    const queryString = new URLSearchParams(data).toString();
    const requestUrl = `${url}?${queryString}`;

    return new Promise((resolve, reject) => {
        axios.get(requestUrl, { headers })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

//ip info
async function getIpInfo(ipAddress) {
    const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);

    return await ipinfo.lookupIp(ipAddress)
}

export {
    sendGetDataWithAxios,
    getIpInfo
}