// src/components/CreateSourceModal.tsx

import React, { useCallback, useMemo, useState } from "react"
import MonacoEditor from "@monaco-editor/react"
// 假设您的项目中有一个基础 Modal 组件
// 如果没有，您可能需要自己实现一个简单的 Modal 结构
import Modal from "./Modal" // 请替换为项目中实际的 Modal 组件路径

interface CreateSourceModalProps {
  isOpen: boolean
  onClose: () => void
  // 假设您有一个通知或刷新列表的 hook
  // onSourceCreated: () => void;
}

// 默认代码模板
function defaultCodeTemplate(id: string) {
  return `
import * as cheerio from "cheerio";
import type { NewsItem } from "@shared/types";
import { defineSource, myFetch } from "@shared/utils"; // 假设 defineSource 和 myFetch 可用

// 请使用 defineSource 包裹您的异步函数
const ${id} = defineSource(async () => {
    // 示例：获取 HTML 内容
    // const html: any = await myFetch("https://example.com/");
    // const $ = cheerio.load(html);
    
    const news: NewsItem[] = [];
    
    // 爬取逻辑
    
    return news; // 必须返回 NewsItem[]
});
`
}

// 默认 JSON 配置
const defaultJsonConfig = {
  title: "我的新源标题",
  home: "https://example.com/",
  interval: 600000, // 默认 10 分钟
  column: "tech", // 默认为 tech, 可能是您项目中的分类
}

const CreateSourceModal: React.FC<CreateSourceModalProps> = ({ isOpen, onClose }) => {
  const [sourceId, setSourceId] = useState("")
  const [configJson, setConfigJson] = useState(JSON.stringify(defaultJsonConfig, null, 2))
  const [sourceCode, setSourceCode] = useState(defaultCodeTemplate("mySource"))
  const [status, setStatus] = useState<"idle" | "saving" | "restarting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  // 动态生成代码模板，以便 ID 变化时更新函数名
  const currentCode = useMemo(() => {
    const fnName = sourceId || "mySource"
    // 替换模板中的默认函数名
    return sourceCode.replace(/const\s+\w+\s+=/, `const ${fnName} =`)
  }, [sourceCode, sourceId])

  const handleSave = useCallback(async () => {
    if (!sourceId) {
      setErrorMsg("源 ID 不能为空。")
      return
    }

    // 1. 验证 JSON 格式
    try {
      JSON.parse(configJson)
    } catch (e: any) {
      setErrorMsg(`JSON 配置格式错误。${e}`)
      return
    }

    // 2. 准备发送的数据
    const dataToSend = {
      id: sourceId,
      config: JSON.parse(configJson),
      // 确保后端自动添加 export default
      code: currentCode,
    }

    // 3. 调用 /api/create-source
    try {
      setErrorMsg("")
      setStatus("saving")

      const createResponse = await myFetch("/create-source", {
        method: "POST",
        body: JSON.stringify(dataToSend),
        headers: { "Content-Type": "application/json" },
      })

      if (!createResponse.success) {
        throw new Error(createResponse.error || "创建源失败")
      }

      // 4. 调用 /api/reboot
      setStatus("restarting")
      await myFetch("/reboot", { method: "POST" })

      // 5. 完成
      setStatus("success")
      setTimeout(onClose, 2000) // 2秒后关闭弹窗
      // onSourceCreated(); // 触发列表刷新
    } catch (e: any) {
      console.error(e)
      setStatus("error")
      setErrorMsg(`操作失败: ${e.message}`)
    }
  }, [sourceId, configJson, currentCode, onClose])

  // UnoCSS 类名
  const inputClass = "w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
  const buttonClass = (loading: boolean) => `py-2 px-4 rounded font-bold transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="+ 新增新闻源">
      <div className="p-4 space-y-4 w-[800px] max-w-full">
        <h2 className="text-xl font-bold">源配置 (JSON)</h2>
        <input
          type="text"
          value={sourceId}
          onChange={(e) => {
            setSourceId(e.target.value)
            // 每次 ID 改变时，更新默认模板中的函数名 (仅在编辑时)
            if (!sourceCode.includes("defineSource")) { // 避免在用户编写完代码后替换
              setSourceCode(defaultCodeTemplate(e.target.value))
            }
          }}
          placeholder="请输入源 ID (如: myblog)"
          className={inputClass}
          disabled={status !== "idle"}
        />

        <textarea
          value={configJson}
          onChange={e => setConfigJson(e.target.value)}
          placeholder="请输入 JSON 配置"
          rows={6}
          className={inputClass}
          disabled={status !== "idle"}
        />

        <h2 className="text-xl font-bold pt-4">爬虫代码 (TypeScript)</h2>
        <div className="border border-gray-300 rounded overflow-hidden">
          <MonacoEditor
            theme="vs-dark" // 如果您的 Modal 背景是深色的，使用 vs-dark
            height="400px"
            defaultLanguage="typescript"
            value={currentCode}
            onChange={(val: any) => setSourceCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              readOnly: status !== "idle",
            }}
          />
        </div>

        {/* 提示信息 */}
        <div className="text-sm text-yellow-600 dark:text-yellow-400">
          **提示:** 请确保代码返回 `NewsItem[]` 且无需添加 `export default` 语句。
        </div>

        {/* 错误和操作 */}
        {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={status === "restarting"}
            className="py-2 px-4 rounded border border-gray-400 hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={status !== "idle"}
            className={buttonClass(status !== "idle")}
          >
            {status === "saving" && "正在保存..."}
            {status === "restarting" && "正在重启服务器..."}
            {status === "success" && "保存成功！"}
            {status === "error" && "重试"}
            {status === "idle" && "保存并重启"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CreateSourceModal
