import React, { useState } from 'react';
import { getServerUrl, setServerUrl } from '../../utils/serverConfig';

interface ServerConfigModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Server address editor. Required in packaged builds: there is no Vite proxy
 * inside a Tauri webview, so `/api` has to be pointed at a real host.
 */
const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ open, onClose }) => {
  const [url, setUrl] = useState(() => getServerUrl());
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [message, setMessage] = useState('');

  if (!open) return null;

  const test = async () => {
    const base = url.trim().replace(/\/+$/, '');
    if (!base) {
      setStatus('fail');
      setMessage('请输入服务器地址');
      return;
    }
    setStatus('testing');
    setMessage('');
    try {
      const res = await fetch(`${base}/api/auth/registration-status`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('ok');
      setMessage('连接成功');
    } catch {
      setStatus('fail');
      setMessage('连接失败，检查地址/端口，或服务器是否放行');
    }
  };

  const save = () => {
    setServerUrl(url);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
      }}
    >
      <div
        className="tq-card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 360, maxWidth: '100%', padding: 24 }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--warm-text)' }}>
          服务器地址
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--warm-text-light)', fontWeight: 600, lineHeight: 1.5 }}>
          App 直连后端，不经过代理。留空则使用同源地址（网页版）。
        </p>

        <input
          className="tq-input"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setStatus('idle'); setMessage(''); }}
          placeholder="http://192.168.1.20:3000"
          style={{ width: '100%', boxSizing: 'border-box' }}
        />

        {message && (
          <p style={{
            margin: '8px 0 0', fontSize: 12, fontWeight: 700,
            color: status === 'ok' ? 'var(--warm-success, #2e9e5b)' : 'var(--warm-danger, #d9534f)',
          }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button type="button" className="tq-btn" onClick={test} disabled={status === 'testing'} style={{ flex: 1 }}>
            {status === 'testing' ? '测试中…' : '测试连接'}
          </button>
          <button type="button" className="tq-btn tq-btn-primary" onClick={save} style={{ flex: 1 }}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export { ServerConfigModal };
export default ServerConfigModal;
