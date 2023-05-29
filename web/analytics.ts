export type ClientIPInfo = {
    ipAddress: string;
    continentCode: string;
    continentName: string;
    countryCode: string;
    countryName: string;
    stateProv: string;
    city: string;
};

export default class Analytics {

    static async getClientIPInfo(): Promise<ClientIPInfo> {
        const response = await fetch('https://api.db-ip.com/v2/free/self');
        const json = await response.json();
        if (!response.ok || json['errorCode'])
            throw new Error(json['error'])

        return <any>json;
    }

}
