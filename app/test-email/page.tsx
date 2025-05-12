"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('friendly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/test-email?email=${encodeURIComponent(email)}&tone=${tone}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Email Sending</h1>
        <p className="text-gray-600">
          Use this page to test sending MailGoal emails with different tones and settings.
        </p>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Home
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium mb-1">
            Email Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="motivational">Motivational</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the tone of the email you want to receive
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Email Sent Successfully</h2>
          <div className="bg-green-50 p-3 rounded border border-green-200 mb-4">
            <p>Email sent to: <strong>{email}</strong></p>
            <p>Message ID: <strong>{result.sendResult?.messageId || 'Not available'}</strong></p>
          </div>

          <h3 className="text-lg font-medium mb-2">Email Preview</h3>
          <div className="border rounded p-4 bg-white">
            <div dangerouslySetInnerHTML={{ __html: result.emailContent }} />
          </div>
        </div>
      )}
    </div>
  );
} 