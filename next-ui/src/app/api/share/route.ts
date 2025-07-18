import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let shareData: { url?: string; title?: string; text?: string } = {};

    // Check if it's multipart form data
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (from Instagram, etc.)
      const formData = await request.formData();
      shareData = {
        url: formData.get('url') as string || '',
        title: formData.get('title') as string || '',
        text: formData.get('text') as string || ''
      };
    } else {
      // Handle URL-encoded form data
      const body = await request.text();
      const params = new URLSearchParams(body);
      shareData = {
        url: params.get('url') || '',
        title: params.get('title') || '',
        text: params.get('text') || ''
      };
    }

    // Validate required URL
    if (!shareData.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${backendUrl}/bookmarks/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        url: shareData.url,
        title: shareData.title || shareData.text,
        text: shareData.text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Content saved successfully',
      data: shareData
    });

  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 