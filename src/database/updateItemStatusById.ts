import { Database } from 'sqlite3';
import { PlayStatus } from '..';

export default async (database: Database, status: PlayStatus, itemId: number) => {
    const DEBUG = process.env.DEBUG === 'true';

    DEBUG && console.log(`Set item with ID ${itemId} from \`queue\` table to \`status\` = ${status}`);

    await new Promise<void>((resolve, reject) => {
        database.run(
            `UPDATE queue
            SET status = ?
            WHERE id = ?`,
            [status, itemId],
            (error: Error) => {
                if (error) {
                    reject(error);
                }
                resolve();
            },
        );
    });
};
