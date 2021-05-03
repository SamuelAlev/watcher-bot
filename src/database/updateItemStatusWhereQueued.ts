import { Database } from 'sqlite3';
import { PlayStatus } from '..';

export default async (database: Database, status: PlayStatus) => {
    const DEBUG = process.env.DEBUG === 'true';

    if (DEBUG) {
        console.log(`Set item with status \`${status}\` from \`queue\` table to \`status\` = ${status}`);
    }

    await new Promise<void>((resolve, reject) => {
        database.run(
            `UPDATE queue
            SET status = ?
            WHERE status = ${PlayStatus.Queued}`,
            [status],
            (error: Error) => {
                if (error) {
                    reject(error);
                }
                resolve();
            },
        );
    });
};
