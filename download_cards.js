import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 目标目录
const targetDir = path.join(__dirname, 'frontend', 'src', 'assets', 'cards');

// 创建目录
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 角色映射表（GitHub文件名 -> 我们的标准命名）
const roleMapping = {
  'werewolf.png': 'werewolf.png',
  'minion.png': 'minion.png',
  'mason.png': 'mason.png',
  'seer.png': 'seer.png',
  'robber.png': 'robber.png',
  'troublemaker.png': 'troublemaker.png',
  'drunk.png': 'drunk.png',
  'insomniac.png': 'insomniac.png',
  'villager.png': 'villager.png',
  'hunter.png': 'hunter.png',
  'tanner.png': 'tanner.png',
  'doppelganger.png': 'doppelganger.png'
};

const baseUrl = 'https://raw.githubusercontent.com/DrSkunk/one-night-ultimate-discord/main/assets/imgs/';

let downloaded = 0;
let total = Object.keys(roleMapping).length;

function downloadFile(sourceFile, targetFile) {
  return new Promise((resolve, reject) => {
    const url = baseUrl + sourceFile;
    const filePath = path.join(targetDir, targetFile);

    console.log(`下载: ${sourceFile} -> ${targetFile}`);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          downloaded++;
          console.log(`✓ 完成 (${downloaded}/${total}): ${targetFile}`);
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
}

async function downloadAll() {
  console.log(`开始下载 ${total} 张角色卡牌...`);
  console.log(`目标目录: ${targetDir}\n`);

  for (const [source, target] of Object.entries(roleMapping)) {
    try {
      await downloadFile(source, target);
    } catch (error) {
      console.error(`✗ 失败: ${source} - ${error.message}`);
    }
  }

  console.log(`\n下载完成！成功: ${downloaded}/${total}`);
}

downloadAll();
