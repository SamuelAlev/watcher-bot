import { readFileSync } from 'fs';
import { join } from 'path';
import { Database, RunResult } from 'sqlite3';

export default async (database: Database) => {
    const DEBUG = process.env.DEBUG === 'true';

    const initSql = readFileSync(join(__dirname, '..', 'database', 'init.sql'), { encoding: 'utf-8' });

    DEBUG && console.log(initSql);

    await new Promise<void>((resolve, reject) => {
        database.run(initSql, (_row: RunResult, error: Error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
};
