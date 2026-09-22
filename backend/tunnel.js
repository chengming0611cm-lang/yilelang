// 临时脚本：用 localtunnel 暴露本地 3000 端口到公网
import localtunnel from 'localtunnel';

const tunnel = await localtunnel({ port: 3000 });
console.log('TUNNEL_URL=' + tunnel.url);

tunnel.on('close', () => console.log('隧道已关闭'));
tunnel.on('error', (err) => console.error('隧道错误:', err.message));

process.on('SIGINT', () => { tunnel.close(); process.exit(0); });
