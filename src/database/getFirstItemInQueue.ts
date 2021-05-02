import { Database, RunResult } from 'sqlite3';
import { QueueItem } from '..';

export default async (database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log('Getting the first entry to be played from the `queue` table');
    }

    return await new Promise<QueueItem>((resolve, reject) => {
        database.get(`SELECT * FROM queue WHERE status = 1`, (error: Error, row: RunResult) => {
            //@ts-ignore
            const item = row as QueueItem;

            if (error) {
                reject(error);
            }

            if (DEBUG) {
                console.log(`First entry to be played in the queue:`, item);
            }

            resolve(item);
        });
    });
};
