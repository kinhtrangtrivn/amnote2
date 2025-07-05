"use client"

// CostObjectPage.tsx

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import * as Icons from "lucide-react"

import ExcelImportModal from "./ExcelImportModal"
import PrintModal from "./PrintModal"
import Pagination from "./Pagination/Pagination"

/** Mô tả cấu trúc một đối tượng tập hợp chi phí */
interface DoiTuongTapHopChiPhi {
  id: string
  code: string
  nameVi: string
  nameEn: string
  nameKo: string
  parentObject: string // id cha hoặc '' nếu root
  notes: string
  createdDate: string
  status: "active" | "inactive"
}

interface ColumnConfig {
  id: string
  dataField: string
  displayName: string
  width: number
  visible: boolean
  pinned: boolean
  originalOrder: number
}

// Tạo dữ liệu mẫu lớn để test hiệu suất
const generateMockData = (count: number): DoiTuongTapHopChiPhi[] => {
  const data: DoiTuongTapHopChiPhi[] = []
  const departments = ["Sản Xuất", "Marketing", "Kế Toán", "IT", "Nhân Sự", "Kinh Doanh", "Vận Hành", "Chất Lượng"]
  const subDepts = ["Team A", "Team B", "Team C", "Phòng Ban", "Bộ Phận", "Chi Nhánh"]

  for (let i = 1; i <= count; i++) {
    const isParent = i <= Math.floor(count * 0.3) // 30% là parent
    const parentId = isParent ? "0" : Math.floor(Math.random() * Math.floor(count * 0.3) + 1).toString()

    data.push({
      id: i.toString(),
      code: `CC${i.toString().padStart(3, "0")}`,
      nameVi: isParent
        ? `Phòng ${departments[i % departments.length]}`
        : `${subDepts[i % subDepts.length]} ${departments[i % departments.length]}`,
      nameEn: isParent
        ? `${departments[i % departments.length]} Department`
        : `${subDepts[i % subDepts.length]} ${departments[i % departments.length]}`,
      nameKo: isParent
        ? `${departments[i % departments.length]}부`
        : `${subDepts[i % subDepts.length]} ${departments[i % departments.length]}`,
      parentObject: parentId,
      notes: `Ghi chú cho đối tượng ${i}`,
      createdDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split("T")[0],
      status: "active",
    })
  }

  return data
}

const CostObjectPage: React.FC = () => {
  // --- State dữ liệu ---
  const [doiTuongList, setDoiTuongList] = useState<DoiTuongTapHopChiPhi[]>(
    () => generateMockData(1000), // Tạo 1000 bản ghi để test
  )

  // Modal Excel
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  // Modal Print
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Hàm xử lý import từ Excel với các phương pháp khác nhau
  const handleImportFromExcel = useCallback(
    (rows: any[], method: "add" | "update" | "overwrite") => {
      console.log("Processing import with method:", method)
      console.log("Import data:", rows)
      console.log("Current data count:", doiTuongList.length)

      if (method === "overwrite") {
        setDoiTuongList((prevList) => {
          const updatedList = [...prevList] // Start with a copy of the current list
          let addedCount = 0
          let updatedCount = 0

          rows.forEach((row, idx) => {
            const existingIndex = updatedList.findIndex((item) => item.code === row.code)

            if (existingIndex !== -1) {
              // Update existing record
              updatedList[existingIndex] = {
                ...updatedList[existingIndex],
                nameVi: row.nameVi || updatedList[existingIndex].nameVi,
                nameEn: row.nameEn || updatedList[existingIndex].nameEn,
                nameKo: row.nameKo || updatedList[existingIndex].nameKo,
                parentObject: row.parentObject || "0", // Use "0" if parentObject is empty/invalid
                notes: row.notes || updatedList[existingIndex].notes,
              }
              updatedCount++
            } else {
              // Add new record
              const newItem: DoiTuongTapHopChiPhi = {
                id: `${Date.now()}-${idx}`, // Generate a unique ID
                code: row.code,
                nameVi: row.nameVi,
                nameEn: row.nameEn || "",
                nameKo: row.nameKo || "",
                parentObject: row.parentObject || "0", // Use "0" if parentObject is empty/invalid
                notes: row.notes || "",
                createdDate: new Date().toISOString().split("T")[0],
                status: "active" as const,
              }
              updatedList.push(newItem)
              addedCount++
            }
          })

          console.log(
            `Overwrite completed. Added ${addedCount} new records, updated ${updatedCount} records. Total: ${updatedList.length}`,
          )
          return updatedList
        })
      } else if (method === "update") {
        // Cập nhật: Chỉ cập nhật các bản ghi đã tồn tại
        setDoiTuongList((prevList) => {
          const updatedList = [...prevList]
          let updatedCount = 0

          rows.forEach((row) => {
            const existingIndex = updatedList.findIndex((item) => item.code === row.code)
            if (existingIndex !== -1) {
              // Giữ nguyên ID và một số thông tin cũ, chỉ cập nhật thông tin mới
              updatedList[existingIndex] = {
                ...updatedList[existingIndex], // Giữ nguyên id, createdDate, status
                nameVi: row.nameVi || updatedList[existingIndex].nameVi,
                nameEn: row.nameEn || updatedList[existingIndex].nameEn,
                nameKo: row.nameKo || updatedList[existingIndex].nameKo,
                parentObject: row.parentObject || updatedList[existingIndex].parentObject,
                notes: row.notes || updatedList[existingIndex].notes,
              }
              updatedCount++
              console.log(`Updated existing record: ${row.code}`)
            }
          })

          console.log(`Update completed. Updated ${updatedCount} records out of ${rows.length} input records`)
          return updatedList
        })
      } else {
        // Thêm mới: Chỉ thêm các bản ghi mới (method === "add")
        const items = rows.map((row, idx) => ({
          id: `${Date.now()}-${idx}`,
          code: row.code,
          nameVi: row.nameVi,
          nameEn: row.nameEn || "",
          nameKo: row.nameKo || "",
          parentObject: row.parentObject || "0",
          notes: row.notes || "",
          createdDate: new Date().toISOString().split("T")[0],
          status: "active" as const,
        }))

        setDoiTuongList((prev) => {
          const newList = [...prev, ...items]
          console.log(`Add completed. Added ${items.length} new records. Total: ${newList.length}`)
          return newList
        })
      }

      setIsExcelModalOpen(false)
    },
    [doiTuongList.length],
  )

  // Tree-view: giữ các parent đang expand
  const [expandedParents, setExpandedParents] = useState<string[]>([])
  const toggleExpand = useCallback(
    (id: string) => setExpandedParents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  )

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DoiTuongTapHopChiPhi | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    nameVi: "",
    nameEn: "",
    nameKo: "",
    parentObject: "0",
    notes: "",
  })

  // Search, chọn, bulk, export/print, phân trang
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [showPrintMenu, setShowPrintMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Hover state for rows
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)

  // Toolbar states
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([
    {
      id: "1",
      dataField: "code",
      displayName: "Mã đối tượng",
      width: 150,
      visible: true,
      pinned: false,
      originalOrder: 0,
    },
    {
      id: "2",
      dataField: "nameVi",
      displayName: "Tiếng Việt",
      width: 200,
      visible: true,
      pinned: false,
      originalOrder: 1,
    },
    {
      id: "3",
      dataField: "nameEn",
      displayName: "Tiếng Anh",
      width: 200,
      visible: true,
      pinned: false,
      originalOrder: 2,
    },
    {
      id: "4",
      dataField: "nameKo",
      displayName: "Tiếng Hàn",
      width: 200,
      visible: true,
      pinned: false,
      originalOrder: 3,
    },
    { id: "5", dataField: "notes", displayName: "Ghi chú", width: 250, visible: true, pinned: false, originalOrder: 4 },
  ])

  // Memoized calculations để tối ưu hiệu suất
  const getOrderedColumns = useMemo(() => {
    const visibleColumns = columnConfigs.filter((col) => col.visible)
    const pinnedColumns = visibleColumns.filter((col) => col.pinned).sort((a, b) => a.originalOrder - b.originalOrder)
    const unpinnedColumns = visibleColumns
      .filter((col) => !col.pinned)
      .sort((a, b) => a.originalOrder - b.originalOrder)

    return [...pinnedColumns, ...unpinnedColumns]
  }, [columnConfigs])

  // Tính toán vị trí sticky cho các cột
  const stickyPositions = useMemo(() => {
    const orderedColumns = getOrderedColumns
    const pinnedColumns = orderedColumns.filter((col) => col.pinned)
    const positions: { [key: string]: number } = {}

    const checkboxWidth = 30
    let currentLeft = checkboxWidth

    pinnedColumns.forEach((col) => {
      positions[col.id] = currentLeft
      currentLeft += col.width
    })

    return positions
  }, [getOrderedColumns])

  // Hàm để lấy style cho cột
  const getColumnStyle = useCallback(
    (column: ColumnConfig) => {
      if (!column.pinned) return {}

      return {
        position: "sticky" as const,
        left: stickyPositions[column.id],
        zIndex: 10,
        backgroundColor: "white",
      }
    },
    [stickyPositions],
  )

  // Hàm để lấy style cho header cột
  const getHeaderColumnStyle = useCallback(
    (column: ColumnConfig) => {
      if (!column.pinned) return {}

      return {
        position: "sticky" as const,
        left: stickyPositions[column.id],
        zIndex: 11,
        backgroundColor: "#fef2f2", // bg-red-50
      }
    },
    [stickyPositions],
  )

  // Tối ưu: Memoize filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return doiTuongList

    const lowerSearchTerm = searchTerm.toLowerCase()
    return doiTuongList.filter(
      (item) =>
        item.code.toLowerCase().includes(lowerSearchTerm) ||
        item.nameVi.toLowerCase().includes(lowerSearchTerm) ||
        item.nameEn.toLowerCase().includes(lowerSearchTerm) ||
        item.nameKo.toLowerCase().includes(lowerSearchTerm),
    )
  }, [doiTuongList, searchTerm])

  // Tối ưu: Memoize children map
  const childrenMap = useMemo(() => {
    const map: Record<string, DoiTuongTapHopChiPhi[]> = {}
    filteredData.forEach((item) => {
      if (item.parentObject && item.parentObject !== "0") {
        map[item.parentObject] = map[item.parentObject] || []
        map[item.parentObject].push(item)
      }
    })
    return map
  }, [filteredData])

  // Tối ưu: Memoize root items
  const rootItems = useMemo(
    () => filteredData.filter((item) => !item.parentObject || item.parentObject === "0"),
    [filteredData],
  )

  // Tối ưu: Memoize flattened tree structure
  interface Flattened {
    item: DoiTuongTapHopChiPhi
    depth: number
  }

  const flattenedItems = useMemo(() => {
    const flattenWithDepth = (items: DoiTuongTapHopChiPhi[], depth = 0): Flattened[] =>
      items.reduce<Flattened[]>((acc, item) => {
        acc.push({ item, depth })
        if (expandedParents.includes(item.id) && childrenMap[item.id]) {
          acc.push(...flattenWithDepth(childrenMap[item.id], depth + 1))
        }
        return acc
      }, [])

    // Khi đang search: hiển thị flat list của filtered; nếu không: hiển thị tree-view
    return searchTerm ? filteredData.map((item) => ({ item, depth: 0 })) : flattenWithDepth(rootItems)
  }, [searchTerm, filteredData, rootItems, expandedParents, childrenMap])

  // Tối ưu: Memoize pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(flattenedItems.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const displayed = flattenedItems.slice(startIndex, endIndex)

    return { totalPages, startIndex, endIndex, displayed }
  }, [flattenedItems, currentPage, itemsPerPage])

  const { totalPages, startIndex, endIndex, displayed } = paginationData

  // Hàm để tìm tất cả các con của một đối tượng (đệ quy)
  const getAllChildren = useCallback((parentId: string, items: DoiTuongTapHopChiPhi[]): string[] => {
    const children: string[] = []
    const directChildren = items.filter((item) => item.parentObject === parentId && item.parentObject !== "0")

    directChildren.forEach((child) => {
      children.push(child.id)
      children.push(...getAllChildren(child.id, items))
    })

    return children
  }, [])

  // Hàm kiểm tra xem đối tượng có con hay không
  const hasChildren = useCallback(
    (parentId: string): boolean => {
      return doiTuongList.some((item) => item.parentObject === parentId && item.parentObject !== "0")
    },
    [doiTuongList],
  )

  // Hàm lấy danh sách tên các đối tượng con
  const getChildrenNames = useCallback(
    (parentId: string): string[] => {
      const directChildren = doiTuongList.filter((item) => item.parentObject === parentId && item.parentObject !== "0")
      return directChildren.map((child) => `${child.code} - ${child.nameVi}`)
    },
    [doiTuongList],
  )

  // --- CRUD Handlers ---
  const handleAdd = useCallback(() => {
    setEditingItem(null)
    setFormData({ code: "", nameVi: "", nameEn: "", nameKo: "", parentObject: "0", notes: "" })
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((item: DoiTuongTapHopChiPhi) => {
    setEditingItem(item)
    setFormData({
      code: item.code,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      nameKo: item.nameKo,
      parentObject: item.parentObject,
      notes: item.notes,
    })
    setIsModalOpen(true)
    setShowActionMenu(null)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      // Tìm đối tượng cần xóa
      const itemToDelete = doiTuongList.find((item) => item.id === id)
      if (!itemToDelete) {
        alert("Không tìm thấy đối tượng cần xóa!")
        return
      }

      // Kiểm tra xem đối tượng có con hay không
      if (hasChildren(id)) {
        const childrenNames = getChildrenNames(id)
        const childrenList = childrenNames.slice(0, 5).join("\n") // Hiển thị tối đa 5 con đầu tiên
        const moreChildren = childrenNames.length > 5 ? `\n... và ${childrenNames.length - 5} đối tượng khác` : ""

        alert(
          `Không thể xóa đối tượng "${itemToDelete.code} - ${itemToDelete.nameVi}" vì nó có ${childrenNames.length} đối tượng con:\n\n${childrenList}${moreChildren}\n\nVui lòng xóa tất cả các đối tượng con trước khi xóa đối tượng cha.`,
        )
        setShowActionMenu(null)
        return
      }

      // Nếu không có con, hiển thị xác nhận xóa
      const confirmMessage = `Bạn có chắc chắn muốn xóa đối tượng "${itemToDelete.code} - ${itemToDelete.nameVi}" không?`

      if (window.confirm(confirmMessage)) {
        setDoiTuongList((prev) => prev.filter((x) => x.id !== id))

        // Nếu đối tượng đang được chọn, bỏ chọn nó
        setSelectedItems((prev) => prev.filter((selectedId) => selectedId !== id))

        // Thông báo xóa thành công
        console.log(`Đã xóa thành công đối tượng: ${itemToDelete.code} - ${itemToDelete.nameVi}`)
      }

      setShowActionMenu(null)
    },
    [doiTuongList, hasChildren, getChildrenNames],
  )

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một đối tượng để xóa!")
      return
    }

    // Kiểm tra từng đối tượng được chọn xem có con hay không
    const itemsWithChildren: string[] = []
    const itemsCanDelete: string[] = []

    selectedItems.forEach((id) => {
      const item = doiTuongList.find((x) => x.id === id)
      if (item) {
        if (hasChildren(id)) {
          itemsWithChildren.push(`${item.code} - ${item.nameVi}`)
        } else {
          itemsCanDelete.push(`${item.code} - ${item.nameVi}`)
        }
      }
    })

    // Nếu có đối tượng có con, thông báo lỗi
    if (itemsWithChildren.length > 0) {
      const itemsList = itemsWithChildren.slice(0, 5).join("\n")
      const moreItems = itemsWithChildren.length > 5 ? `\n... và ${itemsWithChildren.length - 5} đối tượng khác` : ""

      alert(
        `Không thể xóa ${itemsWithChildren.length} đối tượng sau vì chúng có đối tượng con:\n\n${itemsList}${moreItems}\n\nVui lòng xóa tất cả các đối tượng con trước khi xóa đối tượng cha.`,
      )
      return
    }

    // Nếu tất cả đối tượng đều có thể xóa
    if (itemsCanDelete.length > 0) {
      const confirmMessage = `Bạn có chắc chắn muốn xóa ${itemsCanDelete.length} đối tượng đã chọn không?\n\n${itemsCanDelete.slice(0, 5).join("\n")}${itemsCanDelete.length > 5 ? `\n... và ${itemsCanDelete.length - 5} đối tượng khác` : ""}`

      if (window.confirm(confirmMessage)) {
        setDoiTuongList((prev) => prev.filter((x) => !selectedItems.includes(x.id)))
        setSelectedItems([])
        console.log(`Đã xóa thành công ${itemsCanDelete.length} đối tượng`)
      }
    }
  }, [selectedItems, doiTuongList, hasChildren])

  const handleSelectAll = useCallback(
    (checked: boolean) => setSelectedItems(checked ? displayed.map(({ item }) => item.id) : []),
    [displayed],
  )

  const handleSelectOne = useCallback(
    (id: string, checked: boolean) =>
      setSelectedItems((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id))),
    [],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (editingItem) {
        setDoiTuongList((prev) => prev.map((x) => (x.id === editingItem.id ? { ...x, ...formData } : x)))
      } else {
        const newItem: DoiTuongTapHopChiPhi = {
          id: Date.now().toString(),
          ...formData,
          createdDate: new Date().toISOString().split("T")[0],
          status: "active",
        }
        setDoiTuongList((prev) => [...prev, newItem])
      }
      setIsModalOpen(false)
    },
    [editingItem, formData],
  )

  const handlePrint = useCallback((lang: "vi" | "en" | "ko") => {
    setIsPrintModalOpen(true)
    setShowPrintMenu(false)
  }, [])

  // Toolbar handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
      setDoiTuongList(generateMockData(1000)) // Regenerate mock data
      console.log("Dữ liệu đã được làm mới")
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleExportExcel = useCallback(() => {
    // Import thư viện xlsx động
    import("xlsx")
      .then((XLSX) => {
        // Chuẩn bị dữ liệu xuất với tất cả các cột
        const exportData = doiTuongList.map((item) => ({
          ID: item.id,
          "Mã đối tượng": item.code,
          "Tên tiếng Việt": item.nameVi,
          "Tên tiếng Anh": item.nameEn,
          "Tên tiếng Hàn": item.nameKo,
          "Đối tượng cha": item.parentObject === "0" || !item.parentObject ? "0" : item.parentObject,
          "Ghi chú": item.notes,
          "Ngày tạo": item.createdDate,
          "Trạng thái": item.status === "active" ? "Hoạt động" : "Không hoạt động",
        }))

        // Tạo workbook và worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(exportData)

        // Thiết lập độ rộng cột
        const colWidths = [
          { wch: 10 }, // ID
          { wch: 15 }, // Mã đối tượng
          { wch: 25 }, // Tên tiếng Việt
          { wch: 25 }, // Tên tiếng Anh
          { wch: 25 }, // Tên tiếng Hàn
          { wch: 30 }, // Đối tượng cha
          { wch: 40 }, // Ghi chú
          { wch: 12 }, // Ngày tạo
          { wch: 12 }, // Trạng thái
        ]
        ws["!cols"] = colWidths

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Đối tượng tập hợp chi phí")

        // Tạo tên file với timestamp
        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-")
        const filename = `doi-tuong-tap-hop-chi-phi-${timestamp}.xlsx`

        // Xuất file bằng cách tạo buffer và blob
        try {
          const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
          const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

          // Tạo link download
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = filename
          link.style.display = "none"

          // Thêm vào DOM, click và xóa
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Giải phóng URL object
          URL.revokeObjectURL(url)

          console.log(`Đã xuất ${exportData.length} bản ghi ra file Excel: ${filename}`)
        } catch (writeError) {
          console.error("Lỗi khi tạo file Excel:", writeError)
          alert("Có lỗi xảy ra khi tạo file Excel. Vui lòng thử lại.")
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải thư viện Excel:", error)
        alert("Có lỗi xảy ra khi tải thư viện Excel. Vui lòng thử lại.")
      })
  }, [displayed, doiTuongList])

  const handleColumnConfigChange = useCallback((columnId: string, field: keyof ColumnConfig, value: any) => {
    setColumnConfigs((prev) => prev.map((col) => (col.id === columnId ? { ...col, [field]: value } : col)))
  }, [])

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Element
      if (showPrintMenu && !t.closest(".print-dropdown")) setShowPrintMenu(false)
      if (showActionMenu && !t.closest(".action-dropdown")) setShowActionMenu(null)
      if (showSettingsPanel && !t.closest(".settings-panel") && !t.closest(".settings-trigger")) {
        setShowSettingsPanel(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [showPrintMenu, showActionMenu, showSettingsPanel])

  // --- Select Đối tượng gốc: ẩn chính item đang edit và tất cả con của nó ---
  const getValidParentOptions = useMemo(() => {
    if (!editingItem) {
      return doiTuongList
    }

    const childrenIds = getAllChildren(editingItem.id, doiTuongList)
    const excludedIds = [editingItem.id, ...childrenIds]

    return doiTuongList.filter((opt) => !excludedIds.includes(opt.id))
  }, [editingItem, doiTuongList, getAllChildren])

  // Tối ưu: Debounce search để tránh re-render liên tục
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset về trang 1 khi search
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  return (
    <div className="space-y-0">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đối tượng tập hợp chi phí</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các đối tượng tập hợp chi phí ({doiTuongList.length.toLocaleString()} bản ghi)
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* In ấn */}
          <div className="relative print-dropdown">
            <button
              onClick={() => handlePrint("vi")}
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              <Icons.Printer size={16} /> <span className="hidden sm:block">In ấn</span>
            </button>
          </div>
          {/* Xuất Excel */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-700"
          >
            <Icons.Upload size={16} /> <span className="hidden sm:block">Nhập Excel</span>
          </button>
          {/* Thêm mới */}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-700"
          >
            <Icons.Plus size={16} /> <span className="hidden sm:block">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* SEARCH & BULK ACTION */}
      <div className="bg-white rounded-xl shadow border ">
        <div className="block sm:flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã, tên…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Toolbar với 3 icon */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1 space-x-1">
              {/* Icon Load lại */}
              <div className="relative group">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Làm mới dữ liệu"
                >
                  <Icons.RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Làm mới dữ liệu
                </div>
              </div>

              {/* Icon Xuất Excel */}
              <div className="relative group">
                <button
                  onClick={handleExportExcel}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-md transition-all"
                  title="Xuất Excel"
                >
                  <Icons.FileSpreadsheet size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Xuất Excel
                </div>
              </div>

              {/* Icon Thiết lập */}
              <div className="relative group">
                <button
                  onClick={() => setShowSettingsPanel(true)}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-md transition-all settings-trigger"
                  title="Thiết lập"
                >
                  <Icons.Settings size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Thiết lập
                </div>
              </div>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex mt-4 sm:mt-0 items-center space-x-4">
              <span className="text-sm text-gray-600">Đã chọn {selectedItems.length} mục</span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-red-700"
              >
                <Icons.Trash2 size={16} /> <span>Xóa</span>
              </button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto relative">
          {isRefreshing && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-30">
              <div className="flex flex-col items-center">
                <Icons.Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
                <p className="text-gray-700">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}
          <table className="min-w-full table-auto">
            <thead className="bg-red-50">
              <tr>
                <th
                  className="sticky left-0 z-20 bg-red-50 px-4 py-3 text-left"
                  style={{
                    width: "30px",
                    minWidth: "30px",
                    maxWidth: "30px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.length === displayed.length && displayed.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                {getOrderedColumns.map((col) => (
                  <th
                    key={col.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-red-700"
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      ...getHeaderColumnStyle(col),
                    }}
                  >
                    <div className="flex items-center">
                      {col.displayName}
                      {col.pinned && <Icons.Pin size={12} className="ml-1 text-red-500" />}
                    </div>
                  </th>
                ))}
                <th
                  className="sticky right-0 z-10 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700"
                  style={{
                    width: "100px",
                    minWidth: "100px",
                    maxWidth: "100px",
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isRefreshing
                ? // Skeleton rows when loading
                  Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                      <td
                        className="sticky left-0 z-15 bg-white px-4 py-3"
                        style={{
                          width: "30px",
                          minWidth: "30px",
                          maxWidth: "30px",
                        }}
                      >
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      </td>
                      {getOrderedColumns.map((col) => (
                        <td
                          key={`skeleton-${rowIndex}-${col.id}`}
                          className="px-4 py-3"
                          style={{
                            width: col.width,
                            minWidth: col.width,
                            ...getColumnStyle(col),
                          }}
                        >
                          <div className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 70 + 30}%` }} />
                        </td>
                      ))}
                      <td
                        className="sticky right-0 z-10 bg-white px-1 py-3 text-center"
                        style={{
                          width: "100px",
                          minWidth: "100px",
                          maxWidth: "100px",
                        }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-6 w-6 bg-gray-200 rounded-lg" />
                          <div className="h-6 w-6 bg-gray-200 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                : // Actual data rows when not loading
                  displayed.map(({ item, depth }) => {
                    const hasChildrenItems = Boolean(childrenMap[item.id]?.length)
                    const isExpanded = expandedParents.includes(item.id)

                    return (
                      <tr
                        key={item.id}
                        className="group hover:bg-gray-50"
                        onMouseEnter={() => setHoveredRowId(item.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <td
                          className="sticky left-0 z-15 bg-white px-4 py-3 group-hover:bg-gray-50"
                          style={{
                            width: "30px",
                            minWidth: "30px",
                            maxWidth: "30px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </td>
                        {getOrderedColumns.map((col) => (
                          <td
                            key={col.id}
                            className="px-4 py-3 group-hover:bg-gray-50"
                            style={{
                              width: col.width,
                              minWidth: col.width,
                              ...getColumnStyle(col),
                            }}
                          >
                            {col.dataField === "code" ? (
                              <div className="flex items-center" style={{ marginLeft: depth * 20 }}>
                                {hasChildrenItems && (
                                  <button onClick={() => toggleExpand(item.id)} className="ml-[-17px] mr-0">
                                    {isExpanded ? <Icons.ChevronDown size={16} /> : <Icons.ChevronRight size={16} />}
                                  </button>
                                )}
                                <span className={depth > 0 ? "text-gray-600" : "font-medium text-gray-900"}>
                                  {item[col.dataField as keyof DoiTuongTapHopChiPhi]}
                                </span>
                              </div>
                            ) : col.dataField === "parentObject" ? (
                              <span className="text-sm text-gray-600">
                                {item.parentObject === "0" || !item.parentObject ? (
                                  <span className="text-gray-400 italic">Không có cha</span>
                                ) : (
                                  (() => {
                                    const parent = doiTuongList.find((p) => p.id === item.parentObject)
                                    return parent ? `${parent.code} - ${parent.nameVi}` : item.parentObject
                                  })()
                                )}
                              </span>
                            ) : col.dataField === "notes" ? (
                              <span className="text-sm text-gray-600 truncate max-w-xs block" title={item.notes}>
                                {item.notes}
                              </span>
                            ) : (
                              <span>{item[col.dataField as keyof DoiTuongTapHopChiPhi]}</span>
                            )}
                          </td>
                        ))}
                        {/* Cột hành động (Edit/Delete) */}
                        <td
                          className="sticky group-hover:bg-gray-50 right-0 z-10 px-1 py-3 text-center"
                          style={{
                            width: "100px",
                            minWidth: "100px",
                            maxWidth: "100px",
                          }}
                        >
                          <div className="flex items-center justify-center space-x-2 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                            {/* Sửa */}
                            <div className="relative">
                              <button
                                onClick={() => handleEdit(item)}
                                className="peer p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Icons.Edit size={16} />
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                                Sửa
                              </div>
                            </div>

                            {/* Xóa */}
                            <div className="relative">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="peer p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Icons.Trash2 size={16} />
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                                Xóa
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>

          {filteredData.length === 0 && !isRefreshing && (
            <div className="text-center py-8">
              <Icons.Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy dữ liệu nào</p>
            </div>
          )}
        </div>

        {/* ENHANCED PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={flattenedItems.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>

      {/* SETTINGS PANEL */}
      {showSettingsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-96 shadow-xl settings-panel flex flex-col">
            <div className="flex-1 flex flex-col h-full ">
              <div className="flex justify-between p-4 border-b ">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thiết lập bảng dữ liệu
                  <div className="text-sm text-gray-400 ">Tùy chỉnh hiển thị các cột trong bảng dữ liệu</div>
                </h3>
                <button onClick={() => setShowSettingsPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Icons.X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {columnConfigs.map((column) => (
                    <div key={column.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      {/* Checkbox và tên cột */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={(e) => handleColumnConfigChange(column.id, "visible", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{column.dataField}</div>
                          <div className="text-sm text-gray-500">Tên cột dữ liệu</div>
                        </div>
                        {column.pinned && (
                          <div className="flex items-center text-blue-600">
                            <Icons.Pin size={14} />
                            <span className="text-xs ml-1">Đã ghim</span>
                          </div>
                        )}
                      </div>

                      {/* Tên hiển thị và Độ rộng cột trên cùng 1 dòng */}
                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tên cột hiển thị</label>
                          <input
                            type="text"
                            value={column.displayName}
                            onChange={(e) => handleColumnConfigChange(column.id, "displayName", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!column.visible}
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                          <input
                            type="number"
                            value={column.width}
                            onChange={(e) =>
                              handleColumnConfigChange(column.id, "width", Number.parseInt(e.target.value) || 100)
                            }
                            min="50"
                            max="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!column.visible}
                          />
                        </div>
                      </div>

                      {/* Ghim cột */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={column.pinned}
                          onChange={(e) => handleColumnConfigChange(column.id, "pinned", e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!column.visible}
                        />
                        <label className="text-sm text-gray-700">Ghim cột bên trái</label>
                      </div>

                      {/* Hiển thị vị trí sticky nếu được ghim */}
                      {column.pinned && column.visible && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="text-xs text-blue-700">
                            <Icons.Info size={12} className="inline mr-1" />
                            Vị trí sticky: {stickyPositions[column.id]}px từ trái
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons - Fixed at bottom */}
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    // Reset to default
                    setColumnConfigs([
                      {
                        id: "1",
                        dataField: "code",
                        displayName: "Mã đối tượng",
                        width: 150,
                        visible: true,
                        pinned: false,
                        originalOrder: 0,
                      },
                      {
                        id: "2",
                        dataField: "nameVi",
                        displayName: "Tiếng Việt",
                        width: 200,
                        visible: true,
                        pinned: false,
                        originalOrder: 1,
                      },
                      {
                        id: "3",
                        dataField: "nameEn",
                        displayName: "Tiếng Anh",
                        width: 200,
                        visible: true,
                        pinned: false,
                        originalOrder: 2,
                      },
                      {
                        id: "4",
                        dataField: "nameKo",
                        displayName: "Tiếng Hàn",
                        width: 200,
                        visible: true,
                        pinned: false,
                        originalOrder: 3,
                      },
                      {
                        id: "5",
                        dataField: "notes",
                        displayName: "Ghi chú",
                        width: 250,
                        visible: true,
                        pinned: false,
                        originalOrder: 4,
                      },
                    ])
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đặt lại mặc định
                </button>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal - Truyền dữ liệu hiện có */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImport={handleImportFromExcel}
        existingData={doiTuongList}
      />

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={doiTuongList}
        companyInfo={{
          name: "Công ty TNHH ABC Technology",
          address: "123 Đường ABC, Quận Ba Đình, Hà Nội",
          taxCode: "0123456789",
        }}
      />

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? "Chỉnh sửa đối tượng" : "Thêm mới đối tượng"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mã & Đối tượng gốc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData((d) => ({ ...d, code: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập mã đối tượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng gốc
                    {editingItem && (
                      <span className="text-xs text-gray-500 ml-2">(Ẩn đối tượng hiện tại và các con)</span>
                    )}
                  </label>
                  <select
                    value={formData.parentObject}
                    onChange={(e) => setFormData((d) => ({ ...d, parentObject: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="0">Không có cha</option>
                    {getValidParentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.code} – {opt.nameVi}
                      </option>
                    ))}
                  </select>
                  {editingItem && getValidParentOptions.length < doiTuongList.length - 1 && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      <Icons.Info size={12} className="mr-1" />
                      Một số tùy chọn bị ẩn để tránh vòng lặp phân cấp
                    </div>
                  )}
                </div>
              </div>

              {/* Tên & Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Việt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameVi}
                    onChange={(e) => setFormData((d) => ({ ...d, nameVi: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Việt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên tiếng Anh</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData((d) => ({ ...d, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Anh"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên tiếng Hàn</label>
                  <input
                    type="text"
                    value={formData.nameKo}
                    onChange={(e) => setFormData((d) => ({ ...d, nameKo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Hàn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Icons.Save size={16} /> <span>{editingItem ? "Cập nhật" : "Thêm mới"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CostObjectPage
