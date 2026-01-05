export default async function keepScreenAlive() {
    try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active!');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}