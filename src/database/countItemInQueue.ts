import { Database, RunResult } from 'sqlite3';
import { PlayStatus } from '..';

export default async (database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log('Counting entries in the `queue` table');

    return await new Promise<number>((resolve, reject) => {
        database.get(
            `SELECT count(*) count FROM queue WHERE status = ${PlayStatus.Playing} OR status = ${PlayStatus.Queued}`,
            (error: Error, row: RunResult) => {
                //@ts-ignore
                const count = row.count;

                if (error) {
                    reject(error);
                }

                DEBUG && console.log(`There is ${count} entry/entries in the \`queue\` table`);

                resolve(count);
            },
        );
    });
};
