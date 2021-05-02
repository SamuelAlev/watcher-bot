import { Database, RunResult } from 'sqlite3';

export default async (database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log('Counting entries in the `queue` table');
    }

    return await new Promise<number>((resolve, reject) => {
    database.get(`SELECT count(*) count FROM queue WHERE status = 1`, (error: Error, row: RunResult) => {
            //@ts-ignore
            const count = row.count;

            if (error) {
                reject(error);
            }

            if (DEBUG) {
                console.log(`There is ${count} entry/entries in the \`queue\` table`);
            }

            resolve(count);
        });
    });
};
