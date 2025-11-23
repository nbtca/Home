import { useState, useEffect } from "react"
import {
  Button,
  Input,
  Textarea,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
} from "@heroui/react"
import { activeClient } from "../../../utils/client"
import { SECTIONS } from "../../../types/member-application"

export default function MemberApplicationForm() {
  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    phone: "",
    section: "",
    qq: "",
    email: "",
    major: "",
    class: "",
    memo: "",
  })

  const [loading, setLoading] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverMessage, setPopoverMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [applicationId, setApplicationId] = useState<string>("")

  // Load saved data from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      const data = localStorage.getItem("memberApplicationFormData")
      if (data) {
        setFormData(JSON.parse(data))
      }
    }
    loadFromLocalStorage()
  }, [])

  // Save form data to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem("memberApplicationFormData", JSON.stringify(formData))
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Auto-fill QQ from QQ email
    if (name === "email") {
      const qqEmailMatch = value.match(/^(\d+)@qq\.com$/i)
      if (qqEmailMatch) {
        const qqNumber = qqEmailMatch[1]
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
          qq: qqNumber,
        }))
      } else {
        setFormData(prevData => ({
          ...prevData,
          [name]: value,
        }))
      }
    }
    // Auto-fill email from QQ number
    else if (name === "qq") {
      setFormData((prevData) => {
        const newData = {
          ...prevData,
          [name]: value,
        }

        const isEmailEmpty = !prevData.email || prevData.email.trim() === ""
        const isEmailQQFormat = /^\d+@qq\.com$/i.test(prevData.email)

        if (value && /^\d+$/.test(value) && (isEmailEmpty || isEmailQQFormat)) {
          newData.email = `${value}@qq.com`
        }

        return newData
      })
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }))
    }

    // Clear error for this field
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
      } catch (error) {
        console.error("Failed to save form data to local storage", error)
      }
    }, 100)
  }

  // Handle section selection
  const handleSectionChange = (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      section: value,
    }))

    if (errors.section) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.section
        return newErrors
      })
    }

    saveToLocalStorage()
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.memberId || formData.memberId.trim().length === 0) {
      newErrors.memberId = "学号不能为空"
    }

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "姓名不能为空"
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = "电话不能为空"
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "电话格式不正确"
    }

    if (!formData.section || formData.section.trim().length === 0) {
      newErrors.section = "请选择部门"
    }

    // Optional email validation
    if (formData.email && formData.email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "邮箱格式不正确"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setPopoverMessage("请填写所有必填项并确保格式正确")
      setPopoverOpen(true)
      return
    }

    setLoading(true)
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // For now, using activeClient as a placeholder
      const response = await activeClient.memberApplication.postMemberApplicationAdd({
        requestBody: {
          memberId: formData.memberId,
          name: formData.name,
          phone: formData.phone,
          section: formData.section,
          qq: formData.qq || undefined,
          email: formData.email || undefined,
          major: formData.major || undefined,
          class: formData.class || undefined,
          memo: formData.memo || undefined,
        },
      })

      // Clear localStorage on success
      localStorage.removeItem("memberApplicationFormData")

      setApplicationId(response.result?.applicationId || "")
      setPopoverMessage(`申请提交成功！您的申请ID是：${response.result?.applicationId || ""}。请保存此ID以便查询申请状态。`)
      setPopoverOpen(true)

      // Reset form
      setTimeout(() => {
        setFormData({
          memberId: "",
          name: "",
          phone: "",
          section: "",
          qq: "",
          email: "",
          major: "",
          class: "",
          memo: "",
        })
      }, 3000)
    } catch (error) {
      console.error("Error submitting application:", error)
      setPopoverMessage("提交失败，请稍后重试。")
      setPopoverOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form className="flex flex-col gap-8">
        {/* Basic Info Section */}
        <div className="flex flex-col md:grid grid-cols-2 gap-4">
          <div className="text-sm text-gray-500 col-span-2">
            基本信息（带*为必填项）
          </div>
          <Input
            name="memberId"
            label="学号 *"
            placeholder="请输入学号"
            value={formData.memberId}
            onChange={handleChange}
            required
            isInvalid={!!errors.memberId}
            errorMessage={errors.memberId}
          />
          <Input
            name="name"
            label="姓名 *"
            placeholder="请输入姓名"
            value={formData.name}
            onChange={handleChange}
            required
            isInvalid={!!errors.name}
            errorMessage={errors.name}
          />
          <Input
            name="major"
            label="专业"
            placeholder="请输入专业"
            value={formData.major}
            onChange={handleChange}
          />
          <Input
            name="class"
            label="班级"
            placeholder="请输入班级"
            value={formData.class}
            onChange={handleChange}
          />
        </div>

        {/* Department Selection */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            部门选择 *
          </div>
          <Select
            label="选择部门"
            placeholder="请选择您想加入的部门"
            selectedKeys={formData.section ? [formData.section] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              handleSectionChange(value)
            }}
            isInvalid={!!errors.section}
            errorMessage={errors.section}
            required
          >
            {SECTIONS.map((section) => (
              <SelectItem key={section.value} value={section.value}>
                {section.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Contact Info Section */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            联系方式
          </div>
          <Input
            name="phone"
            label="手机号 *"
            placeholder="请输入手机号"
            value={formData.phone}
            onChange={handleChange}
            required
            isInvalid={!!errors.phone}
            errorMessage={errors.phone}
          />
          <Input
            name="qq"
            label="QQ"
            placeholder="请输入QQ号"
            value={formData.qq}
            onChange={handleChange}
          />
          <Input
            name="email"
            label="邮箱"
            placeholder="请输入邮箱"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />
        </div>

        {/* Self Introduction */}
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-500">
            自我介绍
          </div>
          <Textarea
            name="memo"
            label="备注"
            placeholder="简单介绍一下自己，说说为什么想加入协会..."
            value={formData.memo}
            onChange={handleChange}
            minRows={4}
          />
        </div>
      </form>

      {/* Submit Button with Popover */}
      <Popover
        isOpen={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        <PopoverTrigger>
          <Button
            className="mt-12"
            type="button"
            color="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            style={{
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <Spinner size="sm" color="white" /> : "提交申请"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            maxWidth: "400px",
          }}
        >
          <p className="whitespace-pre-wrap">{popoverMessage}</p>
        </PopoverContent>
      </Popover>

      {applicationId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            您的申请ID：<span className="font-mono font-bold">{applicationId}</span>
          </p>
          <p className="text-xs text-green-600 mt-2">
            请保存此ID以便后续查询申请状态
          </p>
        </div>
      )}
    </div>
  )
}
