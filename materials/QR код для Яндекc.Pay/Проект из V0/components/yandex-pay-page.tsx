"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronRight,
  ChevronDown,
  Circle,
  CheckCircle2,
  Menu,
  User,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Store {
  storeId: string
  storeName: string
  hasYandexPayKey: boolean
  yandexPayKeyLastUpdatedUtc?: string
  terminalsConfigured: "none" | "partial" | "full"
}

interface Organization {
  organizationId: string
  organizationName: string
  stores: Store[]
}

interface KeyDetails {
  yandexPayKey: string | null
  lastUpdatedUtc: string | null
  updatedByUserName: string | null
}

interface Terminal {
  terminalId: string
  terminalName: string
  accountKey: string | null
  accountName: string | null
}

interface Account {
  key: string
  name: string
  active: number
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function YandexPayIntegrationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [keyDetails, setKeyDetails] = useState<KeyDetails | null>(null)
  const [keyValue, setKeyValue] = useState("")
  const [originalKeyValue, setOriginalKeyValue] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [terminals, setTerminals] = useState<Terminal[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [isLoadingStore, setIsLoadingStore] = useState(false)
  const [defaultAccountKey, setDefaultAccountKey] = useState<string | null>(null)
  const [originalDefaultAccountKey, setOriginalDefaultAccountKey] = useState<string | null>(null)

  const { toast } = useToast()

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    // Mock data - replace with actual API call
    // GET /api/integrations/yandex-pay/stores-with-keys
    const mockData: Organization[] = [
      {
        organizationId: "1",
        organizationName: 'ООО "Ресторанная группа Север"',
        stores: [
          { storeId: "101", storeName: 'Ресторан "Премьер"', hasYandexPayKey: true, terminalsConfigured: "partial" },
          { storeId: "102", storeName: 'Кафе "Уют"', hasYandexPayKey: false, terminalsConfigured: "none" },
          { storeId: "103", storeName: 'Бар "Огонёк"', hasYandexPayKey: false, terminalsConfigured: "none" },
        ],
      },
      {
        organizationId: "2",
        organizationName: "ИП Иванов А.В.",
        stores: [
          { storeId: "201", storeName: 'Пиццерия "Капричоза"', hasYandexPayKey: false, terminalsConfigured: "none" },
          { storeId: "202", storeName: 'Суши-бар "Токио"', hasYandexPayKey: true, terminalsConfigured: "full" },
        ],
      },
      {
        organizationId: "3",
        organizationName: 'ООО "Быстрое питание"',
        stores: [
          { storeId: "301", storeName: "Бургерная №1", hasYandexPayKey: true, terminalsConfigured: "none" },
          { storeId: "302", storeName: "Бургерная №2", hasYandexPayKey: false, terminalsConfigured: "none" },
          { storeId: "303", storeName: "Бургерная №3", hasYandexPayKey: true, terminalsConfigured: "full" },
        ],
      },
    ]
    setOrganizations(mockData)
  }, [])

  const toggleOrganization = useCallback((orgId: string) => {
    setExpandedOrgs((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(orgId)) {
        newExpanded.delete(orgId)
      } else {
        newExpanded.add(orgId)
      }
      return newExpanded
    })
  }, [])

  const filteredOrganizations = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return organizations
    }

    const query = debouncedSearchQuery.toLowerCase()
    return organizations
      .map((org) => {
        const matchingStores = org.stores.filter((store) => store.storeName.toLowerCase().includes(query))

        if (matchingStores.length > 0) {
          return { ...org, stores: matchingStores }
        }
        return null
      })
      .filter((org): org is Organization => org !== null)
  }, [organizations, debouncedSearchQuery])

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const newExpanded = new Set(filteredOrganizations.map((org) => org.organizationId))
      setExpandedOrgs(newExpanded)
    }
  }, [debouncedSearchQuery, filteredOrganizations])

  const selectStore = useCallback(async (store: Store) => {
    setIsLoadingStore(true)
    setSelectedStore(store)
    setErrorMessage("")

    // Mock API call - replace with actual call
    // GET /api/integrations/yandex-pay/key/${store.storeId}
    await new Promise((resolve) => setTimeout(resolve, 300))

    const mockKeyDetails: KeyDetails = store.hasYandexPayKey
      ? {
          yandexPayKey: "yk_test_1234567890abcdef",
          lastUpdatedUtc: "2025-11-18T10:32:00Z",
          updatedByUserName: "Администратор Иванов",
        }
      : {
          yandexPayKey: null,
          lastUpdatedUtc: null,
          updatedByUserName: null,
        }

    setKeyDetails(mockKeyDetails)
    setKeyValue(mockKeyDetails.yandexPayKey || "")
    setOriginalKeyValue(mockKeyDetails.yandexPayKey || "")

    if (store.hasYandexPayKey) {
      await loadTerminalsAndAccounts(store.storeId)
    } else {
      setTerminals([])
      setAccounts([])
      setDefaultAccountKey(null)
      setOriginalDefaultAccountKey(null)
    }

    setIsLoadingStore(false)
  }, [])

  const loadTerminalsAndAccounts = async (storeId: string) => {
    // Mock API calls - replace with actual calls
    // GET /api/integrations/yandex-pay/terminals/${storeId}
    // GET /api/integrations/yandex-pay/accounts

    const mockTerminals: Terminal[] =
      storeId === "301"
        ? [] // Бургерная №1 has no terminals yet
        : [
            {
              terminalId: "t1",
              terminalName: "Касса 1",
              accountKey: "BS1F00733B8T64BE8O1BT9CA8VLKIH69",
              accountName: "QR табличка - ID 00095",
            },
            { terminalId: "t2", terminalName: "Касса 2", accountKey: null, accountName: null },
            {
              terminalId: "t3",
              terminalName: "Касса 3",
              accountKey: "AS1R000RK04U6NRV8F1O5SRIRTJAHAHR",
              accountName: "QR табличка - ID 35126",
            },
          ]

    const mockAccounts: Account[] = [
      { key: "BS1F00733B8T64BE8O1BT9CA8VLKIH69", name: "QR табличка - ID 00095", active: 1 },
      { key: "AS1R000RK04U6NRV8F1O5SRIRTJAHAHR", name: "QR табличка - ID 35126", active: 1 },
      { key: "CS1T001AB02C3DE4FG5H6IJ7KL8MN9OP", name: "QR табличка - ID 48302", active: 1 },
    ]

    setTerminals(mockTerminals)
    setAccounts(mockAccounts)

    const mockDefaultAccount = storeId === "301" ? "BS1F00733B8T64BE8O1BT9CA8VLKIH69" : null
    setDefaultAccountKey(mockDefaultAccount)
    setOriginalDefaultAccountKey(mockDefaultAccount)
  }

  const handleRefreshAccounts = async () => {
    if (!selectedStore) return

    setIsLoadingAccounts(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoadingAccounts(false)
    toast({
      title: "Список табличек обновлён",
      duration: 3000,
    })
  }

  const calculateTerminalsConfigured = useCallback(
    (terminals: Terminal[], hasKey: boolean): "none" | "partial" | "full" => {
      if (terminals.length === 0) return hasKey ? "partial" : "none"

      const assignedCount = terminals.filter((t) => t.accountKey !== null).length

      if (assignedCount === 0) return hasKey ? "partial" : "none"
      if (assignedCount === terminals.length) return "full"
      return "partial"
    },
    [],
  )

  const handleAccountAssignment = useCallback(
    (terminalId: string, accountKey: string | null) => {
      if (!selectedStore) return

      const terminal = terminals.find((t) => t.terminalId === terminalId)
      if (!terminal) return

      let toastMessage = ""

      if (accountKey === null) {
        toastMessage = `Привязка снята с ${terminal.terminalName}`
      } else {
        const account = accounts.find((a) => a.key === accountKey)
        toastMessage = `${account?.name || "Табличка"} назначена на ${terminal.terminalName}`
      }

      // Mock API call - replace with actual call
      // POST /api/integrations/yandex-pay/terminal/${terminalId}/account

      const updatedTerminals = terminals.map((t) => {
        if (t.terminalId === terminalId) {
          const account = accounts.find((a) => a.key === accountKey)
          return {
            ...t,
            accountKey: accountKey,
            accountName: account?.name || null,
          }
        }
        return t
      })

      setTerminals(updatedTerminals)

      const newStatus = calculateTerminalsConfigured(updatedTerminals, selectedStore.hasYandexPayKey)
      setOrganizations((orgs) =>
        orgs.map((org) => ({
          ...org,
          stores: org.stores.map((s) =>
            s.storeId === selectedStore.storeId ? { ...s, terminalsConfigured: newStatus } : s,
          ),
        })),
      )

      toast({
        title: toastMessage,
        duration: 3000,
      })
    },
    [selectedStore, terminals, accounts, calculateTerminalsConfigured, toast],
  )

  const handleSave = async () => {
    if (!selectedStore) return

    setErrorMessage("")

    const keyChanged = keyValue !== originalKeyValue
    const defaultAccountChanged = defaultAccountKey !== originalDefaultAccountKey

    if (keyChanged && originalKeyValue) {
      // Key is being changed (not first time setup)
      const updatedTerminals = terminals.map((t) => ({
        ...t,
        accountKey: null,
        accountName: null,
      }))
      setTerminals(updatedTerminals)
      setDefaultAccountKey(null)
      setOriginalDefaultAccountKey(null)

      toast({
        title: "Ключ изменён",
        description: "Все привязки терминалов сброшены. Список табличек обновлён.",
        duration: 4000,
      })
    }

    // Mock API call - replace with actual call
    // POST /api/integrations/yandex-pay/key/${selectedStore.storeId}
    try {
      const mockResponse = {
        error: false,
        data: {
          lastUpdatedUtc: new Date().toISOString(),
          updatedByUserName: "Администратор Петров",
        },
      }

      if (!mockResponse.error) {
        setKeyDetails({
          yandexPayKey: keyValue,
          lastUpdatedUtc: mockResponse.data.lastUpdatedUtc,
          updatedByUserName: mockResponse.data.updatedByUserName,
        })
        setOriginalKeyValue(keyValue)
        setOriginalDefaultAccountKey(defaultAccountKey)

        await loadTerminalsAndAccounts(selectedStore.storeId)

        setOrganizations((orgs) =>
          orgs.map((org) => ({
            ...org,
            stores: org.stores.map((s) =>
              s.storeId === selectedStore.storeId ? { ...s, hasYandexPayKey: true, terminalsConfigured: "partial" } : s,
            ),
          })),
        )

        toast({
          title: "Изменения сохранены",
          duration: 3000,
        })
      }
    } catch (error) {
      setErrorMessage("Произошла ошибка при сохранении")
    }
  }

  const handleClearKey = async () => {
    if (!selectedStore) return

    setErrorMessage("")

    // Mock API call - replace with actual call
    // DELETE /api/integrations/yandex-pay/key/${selectedStore.storeId}
    try {
      const mockResponse = { error: false }

      if (!mockResponse.error) {
        setKeyValue("")
        setOriginalKeyValue("")
        setKeyDetails({
          yandexPayKey: null,
          lastUpdatedUtc: null,
          updatedByUserName: null,
        })

        setTerminals([])
        setAccounts([])
        setDefaultAccountKey(null)
        setOriginalDefaultAccountKey(null)

        setOrganizations((orgs) =>
          orgs.map((org) => ({
            ...org,
            stores: org.stores.map((s) =>
              s.storeId === selectedStore.storeId ? { ...s, hasYandexPayKey: false, terminalsConfigured: "none" } : s,
            ),
          })),
        )

        toast({
          title: "Ключ Яндекс.Пэй очищен",
          description: "Все привязки терминалов удалены",
          duration: 3000,
        })
      }
    } catch (error) {
      setErrorMessage("Произошла ошибка при очистке ключа")
    }

    setIsDeleteDialogOpen(false)
  }

  const formatDate = (utcString: string | null) => {
    if (!utcString) return ""
    const date = new Date(utcString)
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const assignedTerminalsCount = useMemo(() => terminals.filter((t) => t.accountKey !== null).length, [terminals])

  const isSaveDisabled = useMemo(
    () => (keyValue === originalKeyValue && defaultAccountKey === originalDefaultAccountKey) || keyValue.trim() === "",
    [keyValue, originalKeyValue, defaultAccountKey, originalDefaultAccountKey],
  )

  const getTerminalsUsingAccount = useCallback(
    (accountKey: string, excludeTerminalId?: string) => {
      return terminals.filter((t) => t.accountKey === accountKey && t.terminalId !== excludeTerminalId)
    },
    [terminals],
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background" aria-label="Главное меню">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Открыть меню">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2" aria-label="Логотип iiko">
            <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="text-[#E94B35]" aria-hidden="true">
              <path d="M0 0H8V24H0V0Z" fill="currentColor" />
              <path d="M12 0H20V24H12V0Z" fill="currentColor" />
              <path d="M28 7L32 0H40L36 7H44V17H36L40 24H32L28 17V7Z" fill="currentColor" />
              <path
                d="M52 0C56.4183 0 60 3.58172 60 8V16C60 20.4183 56.4183 24 52 24C47.5817 24 44 20.4183 44 16V8C44 3.58172 47.5817 0 52 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Поиск">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" aria-label="Профиль пользователя">
              <User className="h-4 w-4" />
              <span>user</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-52 border-r border-border bg-sidebar" aria-label="Боковая панель навигации">
          <nav className="space-y-1 p-2">
            <div className="bg-sidebar-accent text-sidebar-accent-foreground rounded px-3 py-2 text-sm font-medium">
              Интеграции
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <div className="border-b border-border bg-background px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold">Яндекс.Пэй</h1>
              <div className="relative w-80">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="Поиск по ресторанам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Поиск по ресторанам"
                />
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-8.5rem)]">
            <div
              className="w-96 border-r border-border overflow-y-auto"
              role="navigation"
              aria-label="Дерево организаций и ресторанов"
            >
              <div className="p-4">
                <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Структура торговых предприятий</h2>
                <div className="space-y-1">
                  {filteredOrganizations.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground" role="status">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredOrganizations.map((org) => (
                      <div key={org.organizationId}>
                        <button
                          onClick={() => toggleOrganization(org.organizationId)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                          aria-expanded={expandedOrgs.has(org.organizationId)}
                          aria-label={`${org.organizationName}, ${expandedOrgs.has(org.organizationId) ? "свернуть" : "развернуть"}`}
                        >
                          {expandedOrgs.has(org.organizationId) ? (
                            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                          )}
                          <span className="flex-1 text-left">{org.organizationName}</span>
                        </button>
                        {expandedOrgs.has(org.organizationId) && (
                          <div className="ml-4 space-y-1 border-l border-border pl-2">
                            {org.stores.map((store) => (
                              <button
                                key={store.storeId}
                                onClick={() => selectStore(store)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent",
                                  selectedStore?.storeId === store.storeId && "bg-accent",
                                )}
                                aria-label={`${store.storeName}, ${
                                  store.terminalsConfigured === "full" && store.hasYandexPayKey
                                    ? "настроено полностью"
                                    : store.terminalsConfigured === "partial" && store.hasYandexPayKey
                                      ? "настроено частично"
                                      : "не настроено"
                                }`}
                                aria-current={selectedStore?.storeId === store.storeId ? "page" : undefined}
                              >
                                <span className="flex-1 text-left">{store.storeName}</span>
                                {store.terminalsConfigured === "full" && store.hasYandexPayKey ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                                ) : store.terminalsConfigured === "partial" && store.hasYandexPayKey ? (
                                  <AlertCircle className="h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
                                ) : (
                                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!selectedStore ? (
                <div className="flex h-full items-center justify-center text-muted-foreground" role="status">
                  Выберите ресторан в дереве слева, чтобы настроить ключ Яндекс.Пэй.
                </div>
              ) : isLoadingStore ? (
                <div className="flex h-full items-center justify-center" role="status" aria-live="polite">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="sr-only">Загрузка данных ресторана...</span>
                </div>
              ) : (
                <div className="p-6">
                  <div className="max-w-2xl space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold">Настройки Яндекс.Пэй</h2>
                      <p className="text-sm text-muted-foreground mt-1">Ресторан: {selectedStore.storeName}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yandex-pay-key">Ключ Яндекс.Пэй</Label>
                      <Input
                        id="yandex-pay-key"
                        value={keyValue}
                        onChange={(e) => setKeyValue(e.target.value)}
                        placeholder="Введите ключ Яндекс.Пэй (например: yk_test_...)"
                        className="font-mono"
                        aria-describedby="key-description"
                        aria-invalid={!!errorMessage}
                      />
                      {errorMessage && (
                        <p className="text-sm text-destructive" role="alert" id="key-error">
                          {errorMessage}
                        </p>
                      )}
                      {keyDetails && (
                        <p className="text-xs text-muted-foreground" id="key-description">
                          {keyDetails.lastUpdatedUtc
                            ? `Обновлён: ${formatDate(keyDetails.lastUpdatedUtc)}, ${keyDetails.updatedByUserName}`
                            : "Ключ ещё не настроен"}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isSaveDisabled} aria-label="Сохранить изменения">
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={!keyDetails?.yandexPayKey}
                        aria-label="Очистить ключ Яндекс.Пэй"
                      >
                        Очистить ключ
                      </Button>
                    </div>

                    {selectedStore.hasYandexPayKey && (
                      <>
                        <Separator className="my-6" />

                        {terminals.length === 0 ? (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">QR-таблички и терминалы</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshAccounts}
                                disabled={isLoadingAccounts}
                                aria-label="Обновить список табличек"
                              >
                                <RefreshCw
                                  className={cn("h-4 w-4 mr-2", isLoadingAccounts && "animate-spin")}
                                  aria-hidden="true"
                                />
                                Обновить таблички
                              </Button>
                            </div>

                            {accounts.length > 0 && (
                              <div className="space-y-2">
                                <Label htmlFor="default-account">Табличка по умолчанию для ресторана</Label>
                                <Select
                                  value={defaultAccountKey || "none"}
                                  onValueChange={(value) => setDefaultAccountKey(value === "none" ? null : value)}
                                >
                                  <SelectTrigger id="default-account" aria-label="Выбор таблички по умолчанию">
                                    <SelectValue placeholder="Не назначена" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none" className="italic text-muted-foreground">
                                      Не назначена
                                    </SelectItem>
                                    {accounts.map((account) => (
                                      <SelectItem key={account.key} value={account.key}>
                                        {account.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  При регистрации новых терминалов им автоматически будет назначена эта табличка
                                </p>
                              </div>
                            )}

                            <Card className="border-orange-200 bg-orange-50/50">
                              <CardContent className="pt-6">
                                <div className="flex gap-3">
                                  <AlertTriangle
                                    className="h-5 w-5 text-orange-500 shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <div className="space-y-3 flex-1">
                                    <div>
                                      <h4 className="font-semibold text-base mb-1">
                                        Терминалы ещё не зарегистрированы
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        Они появятся автоматически после установки и запуска плагина на кассах.
                                      </p>
                                    </div>

                                    {accounts.length > 0 ? (
                                      <div className="space-y-2">
                                        <p className="text-sm font-medium">Доступные QR-таблички:</p>
                                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                                          {accounts.map((account) => (
                                            <li key={account.key} className="list-disc">
                                              {account.name}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Список QR-табличек пуст.</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">QR-таблички и терминалы</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefreshAccounts}
                                disabled={isLoadingAccounts}
                                aria-label="Обновить список табличек"
                              >
                                <RefreshCw
                                  className={cn("h-4 w-4 mr-2", isLoadingAccounts && "animate-spin")}
                                  aria-hidden="true"
                                />
                                Обновить таблички
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="default-account-with-terminals">
                                Табличка по умолчанию для ресторана
                              </Label>
                              <Select
                                value={defaultAccountKey || "none"}
                                onValueChange={(value) => setDefaultAccountKey(value === "none" ? null : value)}
                              >
                                <SelectTrigger
                                  id="default-account-with-terminals"
                                  aria-label="Выбор таблички по умолчанию"
                                >
                                  <SelectValue placeholder="Не назначена" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="italic text-muted-foreground">
                                    Не назначена
                                  </SelectItem>
                                  {accounts.map((account) => (
                                    <SelectItem key={account.key} value={account.key}>
                                      {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                При регистрации новых терминалов им автоматически будет назначена эта табличка
                              </p>
                            </div>

                            <Separator className="my-4" />

                            <h4 className="text-base font-medium">Назначение на терминалы</h4>

                            <div className="space-y-3">
                              <TooltipProvider>
                                {terminals.map((terminal) => (
                                  <Card key={terminal.terminalId}>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base font-medium">{terminal.terminalName}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Select
                                        value={terminal.accountKey || "none"}
                                        onValueChange={(value) =>
                                          handleAccountAssignment(terminal.terminalId, value === "none" ? null : value)
                                        }
                                      >
                                        <SelectTrigger
                                          className="w-full"
                                          aria-label={`Выбор QR-таблички для ${terminal.terminalName}`}
                                        >
                                          <SelectValue placeholder="Не назначена" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none" className="italic text-muted-foreground">
                                            Не назначена
                                          </SelectItem>
                                          {accounts.map((account) => {
                                            const otherTerminals = getTerminalsUsingAccount(
                                              account.key,
                                              terminal.terminalId,
                                            )
                                            const usageCount = otherTerminals.length

                                            return (
                                              <SelectItem key={account.key} value={account.key}>
                                                <div className="flex items-center gap-2">
                                                  <span>{account.name}</span>
                                                  {usageCount > 0 && (
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="text-xs">
                                                          на {usageCount}{" "}
                                                          {usageCount === 1
                                                            ? "терминале"
                                                            : usageCount < 5
                                                              ? "терминалах"
                                                              : "терминалах"}
                                                        </Badge>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <div className="text-xs">
                                                          <p className="font-semibold mb-1">Также назначена на:</p>
                                                          <ul className="list-disc list-inside">
                                                            {otherTerminals.map((t) => (
                                                              <li key={t.terminalId}>{t.terminalName}</li>
                                                            ))}
                                                          </ul>
                                                        </div>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  )}
                                                </div>
                                              </SelectItem>
                                            )
                                          })}
                                        </SelectContent>
                                      </Select>
                                    </CardContent>
                                  </Card>
                                ))}
                              </TooltipProvider>
                            </div>

                            <p className="text-sm text-muted-foreground" role="status">
                              Назначено табличек: {assignedTerminalsCount} из {terminals.length}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить ключ Яндекс.Пэй?</AlertDialogTitle>
            <AlertDialogDescription>
              Очистить ключ Яндекс.Пэй для ресторана "{selectedStore?.storeName}"? Все привязки терминалов и табличка по
              умолчанию будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearKey}>Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
