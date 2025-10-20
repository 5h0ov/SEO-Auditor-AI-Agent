import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // build the redirect URL with hash parameters (client-side only)
  const baseUrl = request.nextUrl.origin;
  const params = new URLSearchParams();
  
  if (error) {
    params.set('error', error);
  } else if (code) {
    params.set('code', code);
  }

  // redirect to home page with hash parameters
  // this keeps the code client-side only
  return NextResponse.redirect(`${baseUrl}/#${params.toString()}`);
}
