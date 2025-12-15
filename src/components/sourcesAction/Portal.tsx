// src/components/Portal.tsx

import type React from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface PortalProps {
  children: React.ReactNode
  wrapperId?: string // 可选的，用于指定渲染的 DOM 元素的 ID
}

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div")
  wrapperElement.setAttribute("id", wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

const Portal: React.FC<PortalProps> = ({ children, wrapperId = "portal-wrapper" }) => {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let element = document.getElementById(wrapperId)
    let systemCreated = false

    // 如果目标 DOM 元素不存在，则创建它并添加到 body
    if (!element) {
      element = createWrapperAndAppendToBody(wrapperId)
      systemCreated = true
    }
    setWrapperElement(element)

    // 清理函数：在组件卸载时移除 DOM 元素（如果是由组件创建的）
    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId])

  // 如果 wrapperElement 尚未准备好，不渲染任何内容
  if (wrapperElement === null) return null

  // 使用 createPortal 将子元素渲染到指定的 DOM 节点
  return createPortal(children, wrapperElement)
}

export default Portal
