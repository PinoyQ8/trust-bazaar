import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
    const keyPath = path.join(process.cwd(), 'validation-key.txt');
    const logPath = path.join(process.cwd(), 'Scan_Logs.txt');
    
    const masterKey = fs.readFileSync(keyPath, 'utf8').trim();
    const clientKey = request.headers.get('x-pioneer-key');

    if (clientKey !== masterKey) {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    try {
        // Hard-Code the Wipe: Write an empty string to the file
        fs.writeFileSync(logPath, '[SYSTEM] LEDGER FLUSHED - RAM CLEARED\n');
        return NextResponse.json({ message: 'MESH-SCAN: RAM FLUSHED' });
    } catch (error) {
        return NextResponse.json({ error: 'Wipe Failure' }, { status: 500 });
    }
}