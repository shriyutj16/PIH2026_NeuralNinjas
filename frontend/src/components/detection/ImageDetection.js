/**
 * Image Detection Component - with OCR extracted text display
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import RiskResult from './RiskResult';

const ImageDetection = () => {
  const { API } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPEG, PNG, GIF, WEBP)');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    setResult(null);
    setExtractedText('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setLoadingMsg('Uploading image...');

    setTimeout(() => setLoadingMsg('Running OCR to extract text...'), 1000);
    setTimeout(() => setLoadingMsg('Analyzing extracted text for scam patterns...'), 4000);
    setTimeout(() => setLoadingMsg('Calculating risk score...'), 7000);

    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const { data } = await API.post('/detection/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.result);
      setExtractedText(data.extractedText || '');
      setOcrConfidence(data.ocrConfidence || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Image analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setExtractedText('');
    setOcrConfidence(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🖼️ Screenshot Scam Analysis</h1>
        <p className="page-subtitle">Upload screenshots — AI reads the text via OCR and detects scam patterns</p>
      </div>

      {!result ? (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📤 Upload Screenshot</h3>
            </div>

            {error && (
              <div className="alert-banner medium" style={{ marginBottom: 16 }}>
                <span className="alert-icon">⚠️</span>
                <div className="alert-content"><p>{error}</p></div>
              </div>
            )}

            {!file ? (
              <div
                className={`upload-zone ${dragover ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragover(true); }}
                onDragLeave={() => setDragover(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => handleFile(e.target.files[0])}
                />
                <div className="upload-icon">🖼️</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Drop screenshot here
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  or click to browse files
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  JPEG, PNG, GIF, WEBP — Max 5MB
                </div>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  {!loading && (
                    <button
                      onClick={handleReset}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(0,0,0,0.7)', border: 'none',
                        color: 'white', borderRadius: '50%', width: 28, height: 28,
                        cursor: 'pointer', fontSize: 14, display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >✕</button>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  📎 {file.name} ({(file.size / 1024).toFixed(1)}KB)
                </div>

                {/* Loading state with steps */}
                {loading ? (
                  <div style={{ padding: 20, background: 'var(--bg-primary)', borderRadius: 10, textAlign: 'center' }}>
                    <div className="loading-spinner" style={{ width: 36, height: 36, margin: '0 auto 12px' }}></div>
                    <div style={{ fontSize: 14, color: 'var(--primary-light)', fontWeight: 600 }}>{loadingMsg}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                      OCR may take 10-20 seconds depending on image size
                    </div>
                    {/* Progress steps */}
                    <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                      {['Upload', 'OCR', 'Analyze', 'Score'].map((step, i) => (
                        <div key={i} style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11,
                          background: loadingMsg.toLowerCase().includes(step.toLowerCase()) || i === 0
                            ? 'rgba(99,102,241,0.3)' : 'var(--bg-secondary)',
                          color: loadingMsg.toLowerCase().includes(step.toLowerCase())
                            ? 'var(--primary-light)' : 'var(--text-muted)',
                          border: '1px solid var(--border)'
                        }}>{step}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-full" onClick={handleAnalyze}>
                    🔍 Analyze Screenshot
                  </button>
                )}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚙️ How It Works</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📤', title: 'Upload Screenshot', desc: 'Upload any screenshot of a suspicious message, email, SMS, or pop-up.' },
                { icon: '🔤', title: 'Real OCR Extraction', desc: 'Tesseract.js reads all text from the image — no matter the font or layout.' },
                { icon: '🧠', title: 'AI Pattern Analysis', desc: '200+ scam patterns checked across 7 categories using NLP.' },
                { icon: '📊', title: 'Risk Score', desc: 'Detailed fraud risk score with breakdown and detected patterns.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#86efac' }}>
                ✅ <strong>Real OCR Powered by Tesseract.js</strong> — extracts actual text from your screenshots for accurate analysis.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Image + Extracted Text */}
          <div className="grid-2" style={{ marginBottom: 16, alignItems: 'start' }}>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>ANALYZED IMAGE:</div>
              <img
                src={preview}
                alt="Analyzed"
                style={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }}
              />
            </div>

            {/* Extracted Text Box */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔤 OCR EXTRACTED TEXT:</div>
                {ocrConfidence > 0 && (
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 10,
                    background: ocrConfidence > 70 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    color: ocrConfidence > 70 ? '#86efac' : '#fcd34d'
                  }}>
                    OCR: {ocrConfidence}% confidence
                  </span>
                )}
              </div>
              {extractedText ? (
                <div style={{
                  background: 'var(--bg-primary)', borderRadius: 8, padding: 12,
                  fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace',
                  border: '1px solid var(--border)', whiteSpace: 'pre-wrap'
                }}>
                  {extractedText}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', padding: 12 }}>
                  No readable text could be extracted from this image.
                </div>
              )}
            </div>
          </div>

          <RiskResult result={result} onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default ImageDetection;