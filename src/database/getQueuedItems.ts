import { Database, RunResult } from 'sqlite3';
import { PlayStatus, QueueItem } from '..';

export default async (database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log('Getting the all entries to be played from the `queue` table');
    }

    return await new Promise<QueueItem[]>((resolve, reject) => {
        database.all(
            `SELECT * FROM queue WHERE status = ${PlayStatus.Playing} OR status = ${PlayStatus.Queued}`,
            (error: Error, rows: RunResult) => {
                if (error) {
                    reject(error);
                }

                //@ts-ignore
                const items = rows as QueueItem[];

                resolve(items);
            },
        );
    });
};
