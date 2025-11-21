import React, { useState } from 'react';
import { submitFeedback } from '../lib/firebase/feedbacks';
import { useAuth } from '../hooks/useAuth';


const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>("idle");

  const handleSubmitFeedback = async () => {
    if (!message.trim() || !user) return;
    setSubmitStatus('submitting');
    const result = await submitFeedback(message, user.uid);
    if (result.success) {
      setSubmitStatus('success');
      setMessage('');
    } else {
      setSubmitStatus('error');
    }
  };

  return (
  <div style={{ minHeight: '100vh', width: '100vw', background: '#FF6A00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 600, width: '100%', padding: 32, background: 'rgba(255,255,255,0.97)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800,
          fontSize: 32,
          color: '#f59e42',
          marginBottom: 28,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          Send Feedback to Dev Team
        </h1>
        {submitStatus === 'success' ? (
          <div style={{
            color: '#22c55e',
            fontSize: 32,
            fontWeight: 700,
            textAlign: 'center',
            margin: '48px 0'
          }}>
            Thank you for your feedback!
          </div>
        ) : (
          <>
            <textarea
              style={{
                width: '100%',
                minHeight: 220,
                marginBottom: 24,
                padding: 14,
                borderRadius: 10,
                border: '2px solid #f59e42',
                fontSize: 18,
                fontFamily: 'inherit',
                resize: 'vertical',
                background: '#fff8f0',
                color: '#222',
                boxSizing: 'border-box',
                outline: 'none',
                lineHeight: 1.5
              }}
              placeholder="e.g. Everything is perfect"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={handleSubmitFeedback}
                style={{
                  padding: '12px 32px',
                  borderRadius: 8,
                  background: '#f59e42',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: 1
                }}
                disabled={submitStatus === 'submitting'}
              >
                {submitStatus === 'submitting' ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
            {submitStatus === 'error' && (
              <div style={{ color: '#ef4444', marginTop: 18, textAlign: 'center', fontSize: 18 }}>
                Failed to send feedback. Please try again.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
