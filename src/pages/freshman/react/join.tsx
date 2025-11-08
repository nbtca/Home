import { useState, useEffect } from "react"
import {
  Button,
  Input,
  Textarea,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react"
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
  const [errors, setErrors] = useState<Record<string, string>>({})// 表单验证错误

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

    // 如果是邮箱字段，检查是否是QQ邮箱并自动填充QQ号
    if (name === "email") {
      const qqEmailMatch = value.match(/^(\d+)@qq\.com$/i)
      if (qqEmailMatch) {
        const qqNumber = qqEmailMatch[1]
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
          qq: qqNumber, // 自动填充QQ号
        }))
      }
      else {
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
        }))
      }
    }
    // 如果是QQ字段，检查是否需要自动填充邮箱
    else if (name === "qq") {
      setFormData((prevData) => {
        const newData = {
          ...prevData,
          [name]: value,
        }

        // 只有在邮箱为空或者邮箱是数字@qq.com格式时，才自动填充
        const isEmailEmpty = !prevData.email || prevData.email.trim() === ""
        const isEmailQQFormat = /^\d+@qq\.com$/i.test(prevData.email)

        // 如果QQ号是纯数字且满足条件，自动填充邮箱
        if (value && /^\d+$/.test(value) && (isEmailEmpty || isEmailQQFormat)) {
          newData.email = `${value}@qq.com`
        }

        return newData
      })
    }
    else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }))
    }

    // 清除该字段的错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    setTimeout(() => {
      try {
        saveToLocalStorage()
      }
      catch (error) {
        console.error("Failed to save form data to local storage", error)
      }
    }, 100)
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 姓名验证
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "姓名不能为空"
    }

    // 学号验证
    if (!formData.number || formData.number.trim().length === 0) {
      newErrors.number = "学号不能为空"
    }

    // 专业验证
    if (!formData.major || formData.major.trim().length === 0) {
      newErrors.major = "专业不能为空"
    }

    // 班级验证
    if (!formData.class || formData.class.trim().length === 0) {
      newErrors.class = "班级不能为空"
    }

    // 邮箱验证
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = "邮箱不能为空"
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理表单提交
  const handleSubmit = async () => {
    // 验证表单
    if (!validateForm()) {
      setPopoverMessage("请填写所有必填项并确保格式正确")
      setPopoverOpen(true)
      return
    }

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
            isInvalid={!!errors.name}
            errorMessage={errors.name}
          />
          <Input
            name="class"
            placeholder="班级"
            value={formData.class}
            onChange={handleChange}
            required
            isInvalid={!!errors.class}
            errorMessage={errors.class}
          />
          <Input
            name="number"
            placeholder="学号"
            value={formData.number}
            onChange={handleChange}
            required
            isInvalid={!!errors.number}
            errorMessage={errors.number}
          />
          <Input
            name="major"
            placeholder="专业"
            value={formData.major}
            onChange={handleChange}
            required
            isInvalid={!!errors.major}
            errorMessage={errors.major}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            我们需要以下信息以便联系你
          </div>
          <Input
            name="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={handleChange}
            required
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />
          <Input
            name="qq"
            placeholder="QQ"
            value={formData.qq}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="电话"
            value={formData.phone}
            onChange={handleChange}
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
