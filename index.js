import { createSQLiteThread, createHttpBackend } from "sqlite-wasm-http";

(async function main() {
    const httpBackend = createHttpBackend({
        maxPageSize: 4096,
        timeout: 10000,
        cacheSize: 4096
    });
    const dbURL =
        'Chinook_Sqlite.sqlite.gz';
    const db = await createSQLiteThread({ http: httpBackend });

    const submitBtn = document.getElementById('submitBtn');
    const inputField = document.getElementById('artistInput');
    const output = document.getElementById('output');
    submitBtn.addEventListener('click', async () => {
        try {
            const sql = "SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = $artist);"
            let columns;
            let rows = [];
            await db('open', { filename: 'file:' + encodeURI(dbURL), vfs: 'http' });
            await db('exec', {
                sql: sql,
                bind: { $artist: inputField.value },
                callback: (row) => {
                    if (!columns) {
                        columns = row.columnNames;
                    }
                    if (row.row) {
                        rows.push(row.row);
                    }
                }
            });
            await db('close', {});
            output.innerHTML = `<table>
            <thead>
                <tr>
                    ${columns.map(col => `<th>${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </table>`
        } catch (e) {
            console.log(JSON.stringify(e))
        }
    })

}());