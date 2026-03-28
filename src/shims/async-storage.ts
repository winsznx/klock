type AsyncStorageValue = string | null
type AsyncStoragePair = [string, AsyncStorageValue]

const memoryStorage = new Map<string, string>()

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  return null
}

async function getItem(key: string): Promise<AsyncStorageValue> {
  const storage = getStorage()

  if (storage) {
    return storage.getItem(key)
  }

  return memoryStorage.get(key) ?? null
}

async function setItem(key: string, value: string): Promise<void> {
  const storage = getStorage()

  if (storage) {
    storage.setItem(key, value)
    return
  }

  memoryStorage.set(key, value)
}

async function removeItem(key: string): Promise<void> {
  const storage = getStorage()

  if (storage) {
    storage.removeItem(key)
    return
  }

  memoryStorage.delete(key)
}

async function clear(): Promise<void> {
  const storage = getStorage()

  if (storage) {
    storage.clear()
    return
  }

  memoryStorage.clear()
}

async function getAllKeys(): Promise<string[]> {
  const storage = getStorage()

  if (storage) {
    return Object.keys(storage)
  }

  return [...memoryStorage.keys()]
}

async function multiGet(keys: readonly string[]): Promise<AsyncStoragePair[]> {
  return Promise.all(keys.map(async (key) => [key, await getItem(key)]))
}

async function multiSet(entries: readonly [string, string][]): Promise<void> {
  await Promise.all(entries.map(([key, value]) => setItem(key, value)))
}

async function multiRemove(keys: readonly string[]): Promise<void> {
  await Promise.all(keys.map((key) => removeItem(key)))
}

async function mergeItem(key: string, value: string): Promise<void> {
  const currentValue = await getItem(key)

  if (!currentValue) {
    await setItem(key, value)
    return
  }

  try {
    const currentJson = JSON.parse(currentValue)
    const nextJson = JSON.parse(value)

    if (typeof currentJson === 'object' && currentJson !== null && typeof nextJson === 'object' && nextJson !== null) {
      await setItem(key, JSON.stringify({ ...currentJson, ...nextJson }))
    } else {
      await setItem(key, value)
    }
  } catch {
    await setItem(key, value)
  }
}

async function multiMerge(entries: readonly [string, string][]): Promise<void> {
  await Promise.all(entries.map(([key, value]) => mergeItem(key, value)))
}

function flushGetRequests(): void {}

function useAsyncStorage(key: string) {
  return {
    getItem: () => getItem(key),
    setItem: (value: string) => setItem(key, value),
    removeItem: () => removeItem(key),
    mergeItem: (value: string) => mergeItem(key, value),
  }
}

const AsyncStorage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  mergeItem,
  multiMerge,
  flushGetRequests,
  useAsyncStorage,
}

export {
  clear,
  flushGetRequests,
  getAllKeys,
  getItem,
  mergeItem,
  multiGet,
  multiMerge,
  multiRemove,
  multiSet,
  removeItem,
  setItem,
  useAsyncStorage,
}

export default AsyncStorage
