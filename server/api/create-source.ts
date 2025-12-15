import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 新增
// --- 修正后的 ESM 路径计算 ---
const __filename = fileURLToPath(import.meta.url); 
const currentDir = path.dirname(__filename);

// 您的 API 文件 (/server/api/create-source.ts) 编译后在 dist/.nitro/dev/index.mjs 中
// 它相对于项目根目录的层级关系在编译后被改变了。
// 假设您的 API 文件在 dist/.nitro/ 下，而您希望找到 projectRoot。
// 我们需要根据实际的目录层级进行调整。

// 假设项目根目录相对于 API 文件在 dist 目录中的路径是固定的三级上级：
// currentDir -> dist/.nitro/dev/
// 1级上级 -> dist/.nitro/
// 2级上级 -> dist/
// 3级上级 -> /workspaces/newsnow-self/ (项目根目录)
const PROJECT_ROOT = path.resolve(currentDir, '..', '..', '..');
const CONFIG_FILE_PATH = path.join(PROJECT_ROOT, 'shared', 'sources.json');
const SOURCES_DIR_PATH = path.join(PROJECT_ROOT, 'server', 'sources');
// 定义 API 路由处理函数
export default defineEventHandler(async (event) => {
    // 假设只允许 POST 请求来创建资源
    if (event.method !== 'POST') {
        return { success: false, error: 'Method Not Allowed' };
    }

    try {
        const data = await readBody(event);
        const { id, config, code } = data;

        if (!id || !config || !code) {
            return { success: false, error: "缺少必要的参数: id, config, 或 code" };
        }

        // --- 1. 写入 sources.json 配置 ---
        const existingSourcesRaw = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
        const existingSources = JSON.parse(existingSourcesRaw);

        if (existingSources[id]) {
            return { success: false, error: `源 ID "${id}" 已存在。` };
        }

        existingSources[id] = config;
        
        // 写入更新后的 JSON
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(existingSources, null, 2));

        // --- 2. 写入 .ts 爬取逻辑文件 ---
        const sourceFilePath = path.join(SOURCES_DIR_PATH, `${id}.ts`);
        fs.writeFileSync(sourceFilePath, code);
       
        // --- 3. 成功响应 ---
        return { 
            success: true, 
            message: `源 "${id}" 文件创建成功。请调用 /api/reboot 接口来生效。` 
        };

    } catch (error: any) {
        // 确保文件操作失败时能捕获错误
        console.error('API /api/create-source 文件操作失败:', error);
        return { 
            success: false, 
            error: `文件操作失败：${error.message}` 
        };
    }
});