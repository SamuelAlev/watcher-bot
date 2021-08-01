import { Database } from 'sqlite3';
import { QueueItem } from '..';

export default async (database: Database, item: QueueItem) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Inserting new entry to `queue` table:', item);

    await new Promise<void>((resolve, reject) => {
        database.run(
            `INSERT INTO queue VALUES (NULL,?,?,?,?,?,?)`,
            [item.originalVideoLink, item.videoLink, item.audioLink, item.captionsLink, item.status, item.createdAt],
            (error: Error) => {
                if (error) {
                    reject(error);
                }
                resolve();
            },
        );
    });
};
