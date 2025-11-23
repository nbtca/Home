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
import { makeLogtoClient } from "../../../utils/auth"

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
  const [authLoading, setAuthLoading] = useState(true)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [popoverMessage, setPopoverMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [applicationId, setApplicationId] = useState<string>("")

  // Check authentication and get email from Logto
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await makeLogtoClient().isAuthenticated()
        if (!authenticated) {
          window.location.href = `/repair/login-hint?redirectUrl=/join`
          return
        }

        // Get user info from Logto
        const userInfo = await makeLogtoClient().getIdTokenClaims()
        const email = userInfo.email || ""

        // Set email from Logto
        setFormData((prev) => ({
          ...prev,
          email: email,
        }))

        setAuthLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        window.location.href = `/repair/login-hint?redirectUrl=/join`
      }
    }
    checkAuth()
  }, [])

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
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

      const currentEmail = formData.email
      setApplicationId(response.result?.applicationId || "")
      setPopoverMessage(`申请提交成功！您的申请ID是：${response.result?.applicationId || ""}。请保存此ID以便查询申请状态。`)
      setPopoverOpen(true)

      // Reset form but keep email from Logto
      setFormData({
        memberId: "",
        name: "",
        phone: "",
        section: "",
        qq: "",
        email: currentEmail,
        major: "",
        class: "",
        memo: "",
      })
    } catch (error) {
      console.error("Error submitting application:", error)
      setPopoverMessage("提交失败，请稍后重试。")
      setPopoverOpen(true)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" label="正在验证登录状态..." />
      </div>
    )
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
            部门选择（带*为必填项）
          </div>
          <Select
            label="选择部门 *"
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
            placeholder="从Logto账号获取"
            value={formData.email}
            isReadOnly
            description="邮箱地址来自您的Logto账号"
            classNames={{
              input: "bg-gray-50",
            }}
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
