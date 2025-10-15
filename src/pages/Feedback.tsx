import React, { useState } from 'react';
import { submitFeedback } from '../firebase/feedbacks';


const Feedback: React.FC = () => {
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>("idle");

  const handleSubmitFeedback = async () => {
    if (!message.trim()) return;
    setSubmitStatus('submitting');
    const result = await submitFeedback(message);
    if (result.success) {
      setSubmitStatus('success');
      setMessage('');
    } else {
      setSubmitStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>Send Feedback to the Dev Team</h2>
      <textarea
        style={{ width: '100%', minHeight: 120, marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        placeholder="Type your feedback here..."
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleSubmitFeedback}
          style={{ padding: '8px 16px', borderRadius: 6, background: '#f59e42', color: '#fff', border: 'none', cursor: 'pointer' }}
          disabled={submitStatus === 'submitting'}
        >
          {submitStatus === 'submitting' ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
      {submitStatus === 'success' && (
        <div style={{ color: '#22c55e', marginTop: 12 }}>Thank you for your feedback!</div>
      )}
      {submitStatus === 'error' && (
        <div style={{ color: '#ef4444', marginTop: 12 }}>Failed to send feedback. Please try again.</div>
      )}

    </div>
  );
};

export default Feedback;
