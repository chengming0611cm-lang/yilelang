// 用 Cloudflare Tunnel 把本地 3000 端口暴露到公网，并生成入口二维码
// 用法: node tunnel.js
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3000;
const CLOUDFLARED = path.join(ROOT, 'cloudflared.exe');
const LOG_FILE = path.join(ROOT, 'tunnel.log');
const QR_PNG = path.join(ROOT, 'qrcode.png');
const QR_HTML = path.join(ROOT, 'qrcode.html');

if (!fs.existsSync(CLOUDFLARED)) {
  console.error(`找不到 cloudflared: ${CLOUDFLARED}`);
  process.exit(1);
}

// 本机网络对 UDP/QUIC 支持不稳定（会出现 "no recent network activity" 反复重连），
// 所以强制走 http2 + IPv4 边缘节点。回源用 127.0.0.1 避免 IPv6 解析问题。
const args = [
  'tunnel',
  '--url', `http://127.0.0.1:${PORT}`,
  '--no-autoupdate',
  '--protocol', 'http2',
  '--edge-ip-version', '4',
];

console.log(`启动 Cloudflare Tunnel -> http://127.0.0.1:${PORT}`);
const cf = spawn(CLOUDFLARED, args, { cwd: ROOT });

const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });
let tunnelUrl = null;

async function onUrlFound(url) {
  if (tunnelUrl) return;
  tunnelUrl = url;
  console.log('TUNNEL_URL=' + url);

  // trycloudflare 子域的 DNS 需要几秒才传播。过早请求会拿到 NXDOMAIN
  // 并被本机 DNS 负缓存住，之后即使隧道正常也解析不了，所以先等一会儿。
  await new Promise((r) => setTimeout(r, 8000));

  const ok = await waitUntilReachable(url);
  if (!ok) {
    console.warn('公网地址暂时不可访问，二维码仍会生成，可稍后重试刷新。');
  }

  await writeQrcode(url, ok);
  console.log(`二维码已生成: ${QR_PNG}`);
  console.log(`展示页面: ${QR_HTML}`);
}

async function waitUntilReachable(url, attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'manual' });
      if (res.status >= 200 && res.status < 400) return true;
    } catch {
      // 可能是 DNS 负缓存导致的解析失败，清一次缓存再重试
      flushDns();
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return false;
}

function flushDns() {
  if (process.platform !== 'win32') return;
  try {
    spawn('ipconfig', ['/flushdns'], { stdio: 'ignore' });
  } catch {
    // 无权限时忽略，等 DNS 自然过期
  }
}

async function writeQrcode(url, reachable) {
  await QRCode.toFile(QR_PNG, url, {
    width: 560,
    margin: 1,
    color: { dark: '#1e3a8a', light: '#ffffff' },
  });

  const dataUrl = await QRCode.toDataURL(url, {
    width: 560,
    margin: 1,
    color: { dark: '#1e3a8a', light: '#ffffff' },
  });

  const statusText = reachable ? '✓ 公网隧道已就绪' : '⚠ 隧道建立中，稍后刷新';
  const statusColor = reachable ? '#48bb78' : '#ed8936';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>一夜终极狼人 - 扫码进入游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.container{background:#fff;border-radius:24px;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center;max-width:500px}
h1{font-size:28px;color:#2d3748;margin-bottom:10px;font-weight:700}
.subtitle{font-size:14px;color:#718096;margin-bottom:30px}
.qr-wrapper{background:#fff;padding:20px;border-radius:16px;display:inline-block;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,.1)}
.qr-wrapper img{display:block;width:280px;height:280px}
.url{font-size:13px;color:#4a5568;background:#f7fafc;padding:12px 16px;border-radius:8px;word-break:break-all;margin-top:20px;font-family:'Courier New',monospace}
.url a{color:#2b6cb0;text-decoration:none}
.tip{font-size:12px;color:#a0aec0;margin-top:15px;line-height:1.6}
.status{display:inline-block;background:${statusColor};color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-top:15px}
</style>
</head>
<body>
<div class="container">
  <h1>🐺 一夜终极狼人</h1>
  <div class="subtitle">扫描二维码开始游戏</div>
  <div class="qr-wrapper">
    <img src="${dataUrl}" alt="游戏入口二维码">
  </div>
  <div class="status">${statusText}</div>
  <div class="url"><a href="${url}" target="_blank" rel="noopener">${url}</a></div>
  <div class="tip">
    <strong>Cloudflare Tunnel 公网直连</strong>：手机无需与电脑同一 WiFi<br>
    生成时间 ${new Date().toLocaleString('zh-CN')}<br>
    隧道进程关闭后此地址即失效，重启会得到新地址
  </div>
</div>
</body>
</html>
`;
  fs.writeFileSync(QR_HTML, html, 'utf8');
}

function handleOutput(chunk) {
  const text = chunk.toString();
  logStream.write(text);
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match) onUrlFound(match[0]);
}

cf.stdout.on('data', handleOutput);
cf.stderr.on('data', handleOutput);

cf.on('exit', (code) => {
  console.log(`cloudflared 已退出 (code=${code})`);
  logStream.end();
  process.exit(code ?? 0);
});

function shutdown() {
  console.log('\n正在关闭隧道...');
  cf.kill();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
