import { NextResponse } from 'next/server';

// 1. UNIVERSAL HANDSHAKE (Clears the 204 Loop)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-pioneer-key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// 2. THE UNIFIED HEARTBEAT (The 200 Pulse)
export async function GET() {
  try {
    return NextResponse.json(
      { 
        status: "SYNC_ACTIVE", 
        node: "X570-TAICHI",
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}