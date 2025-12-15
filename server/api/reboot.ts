// 文件路径: server/api/reboot.ts

import { exec } from "node:child_process"

// !!! 请替换为您实际的编译和重启命令 !!!
// 假设您的项目使用 pnpm，且在生产环境使用 pm2
const BUILD_AND_RESTART_CMD = "pnpm run build && pm2 reload newsnow"
// ------------------------------------

export default defineEventHandler(async (event) => {
  // 建议使用 POST 来触发操作，而不是 GET
  if (event.method !== "POST") {
    return { success: false, error: "Method Not Allowed" }
  }

  console.log(`收到重启请求，执行命令: ${BUILD_AND_RESTART_CMD}`)

  // 使用 exec 异步执行命令
  exec(BUILD_AND_RESTART_CMD, (error, stdout, stderr) => {
    // 命令执行的回调函数会在服务器关闭/重启后才可能运行，
    // 依赖于外部进程管理工具（如 pm2）的行为。
    if (error) {
      console.error(`编译或重启命令执行失败: ${error.message}`)
      // 注意：此时可能无法有效返回 HTTP 错误。
      return
    }

    console.log(`命令执行成功。标准输出:\n${stdout}`)
    if (stderr) {
      console.warn(`命令执行警告/错误输出:\n${stderr}`)
    }
  })

  // 立即响应前端，因为后续的操作会中断当前连接。
  return {
    success: true,
    message: "服务器重启和编译命令已成功触发。请稍候片刻，等待新源生效。",
  }
})
