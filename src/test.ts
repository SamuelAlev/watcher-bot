import youtubedl from 'youtube-dl-exec';

(async () => {
    const result = await youtubedl('https://www.twitch.tv/bobross', {
        getUrl: true,
    });
    //@ts-ignore
    console.log(result as string);
})();
