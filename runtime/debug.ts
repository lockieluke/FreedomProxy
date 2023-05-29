export default class Debug {

    static async remoteLog(message: string) {
        const response = await (window['ogFetch'] as (typeof fetch))(`${window['serverUrl']}/remote-log`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message})
        });

        if (!response.ok)
            throw new Error('Failed to remote log');
    }

    static remoteLogSync(message: string) {
        (async () => {
            try {
                await Debug.remoteLog(message);
            } catch (err) {
                console.error(err);
            }
        })();
    }

}
