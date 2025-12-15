import { motion } from "framer-motion"
import CreateSourceModal from "../sourcesAction/CreateSourceModal"
// function ThemeToggle() {
//   const { isDark, toggleDark } = useDark()
//   return (
//     <li onClick={toggleDark} className="cursor-pointer [&_*]:cursor-pointer transition-all">
//       <span className={$("inline-block", isDark ? "i-ph-moon-stars-duotone" : "i-ph-sun-dim-duotone")} />
//       <span>
//         {isDark ? "浅色模式" : "深色模式"}
//       </span>
//     </li>
//   )
// }

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)
  const [open, setOpen] = useState(false)
  const onClose = () => {
    console.info('s')
    setOpen(false)
  }
  return (
    <span className="relative" onMouseEnter={() => show(true)} onMouseLeave={() => show(false)}>
      <button
        onClick={() => setOpen(true)}
         title="新增新闻源"
         className="i-ph-newspaper-clipping btn"
      >
        {/* 使用 ph-newspaper-clipping 图标 */}
       </button>
      <CreateSourceModal isOpen={open} onClose={onClose} />
    </span>
  )
}
