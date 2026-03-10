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

// 2. THE UNIFIED GATEWAY (Verification + Heartbeat)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isVerification = request.url.includes('validation-key.txt');

  // MESH-SCAN: Detect if the Pi Crawler or Verification check is hitting this route
  if (isVerification) {
    return new NextResponse('47dec09c399ad2c76d2', {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*' 
      },
    });
  }

  // STANDARD HEARTBEAT: The 200 Pulse for E-Network
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