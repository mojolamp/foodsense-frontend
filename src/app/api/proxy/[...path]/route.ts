import { NextRequest, NextResponse } from 'next/server';

// 目標後端 API 地址 (Server-to-Server 溝通，建議用 127.0.0.1 或內網 IP)
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;

    // 1. 重組目標 URL
    // 前端請求: /api/proxy/v1/admin/products -> path: ['v1', 'admin', 'products']
    // 後端目標: http://127.0.0.1:8000/api/v1/admin/products
    const pathString = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${BACKEND_URL}/api/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    // console.log(`[Proxy] Forwarding to: ${targetUrl}`); // Debug Log

    // 2. 準備 Headers (嚴格過濾模式)
    // 只允許白名單 Headers 通過，避免 Cookie 或無效 Header 干擾後端
    const allowedHeaders = ['content-type', 'authorization', 'x-api-key', 'accept', 'x-user-id', 'x-request-id'];
    const newHeaders = new Headers();
    request.headers.forEach((value, key) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
            newHeaders.set(key, value);
        }
    });

    // 3. 轉發請求
    try {
        // Next.js fetch 支援 duplex 選項用於 streaming request body
        // 參考: https://github.com/nodejs/node/issues/46221
        type ProxyFetchOptions = RequestInit & { duplex?: 'half' | 'full' };

        const fetchOptions: ProxyFetchOptions = {
            method: request.method,
            headers: newHeaders,
            duplex: 'half',
        };

        // 只有非 GET/HEAD 請求才帶 Body
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            fetchOptions.body = request.body;
        }

        const response = await fetch(targetUrl, fetchOptions);

        // 4. 回傳結果
        const responseHeaders = new Headers(response.headers);

        // 清理回應 Headers (避免 CORS 洩漏或重複)
        responseHeaders.delete('access-control-allow-origin');
        responseHeaders.delete('access-control-allow-methods');
        // FIX: 避免 ERR_CONTENT_DECODING_FAILED
        // Node-fetch 會自動解壓縮，所以必須移除 encoding header，否則瀏覽器會試圖再次解壓
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('transfer-encoding');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown proxy error';
        console.error('[Proxy] Error:', message);
        return NextResponse.json(
            { error_code: 'PROXY_ERROR', message: `Proxy Error: ${message}` },
            { status: 502 }
        );
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = handleProxy;
