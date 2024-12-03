import { useState, useEffect } from "react"
import {
  Button,
  Input,
  Textarea,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react"
import { activeClient } from "../../../utils/client"

export default function JoinForm() {
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    number: "",
    major: "",
    phone: "",
    qq: "",
    email: "",
    memo: "",
  })

  const [loading, setLoading] = useState(false)// 添加加载状态
  const [popoverOpen, setPopoverOpen] = useState(false)// 控制 Popover 显示
  const [popoverMessage, setPopoverMessage] = useState("")// Popover 显示的消息

  // 在组件挂载时加载本地存储的数据
  useEffect(() => {
    const loadFromLocalStorage = () => {
      const data = localStorage.getItem("formData")
      if (data) {
        setFormData(JSON.parse(data))
      }
    }
    loadFromLocalStorage()
  }, [])

  // 保存表单数据到本地存储
  const saveToLocalStorage = () => {
    localStorage.setItem("formData", JSON.stringify(formData))
  }

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
    setTimeout(() => {
      try {
        saveToLocalStorage()
      }
      catch (error) {
        console.error("Failed to save form data to local storage", error)
      }
    }, 100)
  }

  // 处理表单提交
  const handleSubmit = async () => {
    setLoading(true)// 设置加载状态为 true
    try {
      await activeClient.freshman.postFreshmanAdd({
        requestBody: formData,
      })
      setPopoverMessage("提交成功！后续请加群获取！")
      setPopoverOpen(true) // 显示成功消息
      // 延迟跳转以确保用户能看到 Popover 消息
      setTimeout(() => {
        window.location.href = "/freshman/qrcode"
      }, 2000)
    }
    catch (error) {
      console.error("Error submitting form:", error)
      setPopoverMessage("提交失败，请稍后重试。")
      setPopoverOpen(true)
    }
    finally {
      setLoading(false)// 重置加载状态
    }
  }

  return (
    <div>
      <form className="flex flex-col gap-8">
        <div className="flex flex-col md:grid grid-cols-2 gap-4">
          <div className="text-sm text-gray-500 col-span-2">
            我们需要以下信息用于登记
          </div>
          <Input
            name="name"
            placeholder="姓名"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            name="class"
            placeholder="班级"
            value={formData.class}
            onChange={handleChange}
            required
          />
          <Input
            name="number"
            placeholder="学号"
            value={formData.number}
            onChange={handleChange}
            required
          />
          <Input
            name="major"
            placeholder="专业"
            value={formData.major}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            我们需要以下信息以便联系你
          </div>
          <Input
            name="phone"
            placeholder="电话"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            name="qq"
            placeholder="QQ"
            value={formData.qq}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <Textarea
          label="备注"
          name="memo"
          placeholder=""
          value={formData.memo}
          onChange={handleChange}
        />
      </form>

      {/* Popover 显示提交结果 */}
      <Popover
        isOpen={popoverOpen} // 使用 'isOpen' 来控制可见性
        onOpenChange={setPopoverOpen} // 使用 'onOpenChange' 来处理可见性变化
      >
        <PopoverTrigger>
          <Button
            className="mt-12"
            type="button" // 改为 'button' 类型，防止默认提交行为
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading} // 加载时禁用按钮
            style={{
              cursor: loading ? "not-allowed" : "pointer", // 设置鼠标样式
            }}
          >
            {loading ? <Spinner size="sm" color="white" /> : "提交"} {/* 显示加载动画或提交文本 */}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
          }}
        >
          <p>{popoverMessage}</p> {/* 使用重命名后的组件 */}
        </PopoverContent>
      </Popover>
    </div>
  )
}
