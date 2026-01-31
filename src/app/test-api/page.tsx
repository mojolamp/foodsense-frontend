'use client'

import { useState } from 'react'

interface ApiTestResult {
    status: number
    statusText: string
    data: unknown
    headers: Record<string, string>
}

interface ApiTestError {
    message: string
    stack?: string
    name: string
}

export default function TestApiPage() {
    const [result, setResult] = useState<ApiTestResult | null>(null)
    const [error, setError] = useState<ApiTestError | null>(null)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState('http://localhost:8000/api/v1/admin/products/?limit=10')

    const testConnection = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const status = res.status
            const statusText = res.statusText

            let data
            try {
                data = await res.json()
            } catch (e) {
                data = await res.text()
            }

            setResult({
                status,
                statusText,
                data,
                headers: Object.fromEntries(res.headers.entries())
            })
        } catch (err: unknown) {
            const errorObj = err instanceof Error ? err : new Error(String(err))
            setError({
                message: errorObj.message,
                stack: errorObj.stack,
                name: errorObj.name
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">API Connection Diagnostic</h1>

            <div className="flex gap-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 border p-2 rounded"
                />
                <button
                    onClick={testConnection}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Connection'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-700">
                    <h3 className="font-bold">Connection Error (Client Side)</h3>
                    <pre className="mt-2 text-sm overflow-auto max-h-40">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                    <p className="mt-2 text-sm">
                        Possible causes: CORS blocking, Server down, Network error, Mixed Content (HTTPS vs HTTP).
                    </p>
                </div>
            )}

            {result && (
                <div className="space-y-4">
                    <div className={`p-4 rounded border ${result.status === 200 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <h3 className="font-bold mb-2">Response Status: {result.status} {result.statusText}</h3>

                        <h4 className="font-semibold text-sm mt-4">Response Body:</h4>
                        <pre className="bg-white p-2 rounded border mt-1 text-xs overflow-auto max-h-60">
                            {typeof result.data === 'object' ? JSON.stringify(result.data, null, 2) : String(result.data)}
                        </pre>

                        <h4 className="font-semibold text-sm mt-4">Response Headers:</h4>
                        <pre className="bg-white p-2 rounded border mt-1 text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.headers, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    )
}
