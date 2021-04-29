import youtubedl from 'youtube-dl-exec';

(async () => {
    const result = await youtubedl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
        getUrl: true,
        format: 'bestvideo,bestaudio',
    });
    //@ts-ignore
    console.log((result as string).split('\n'));
})();
