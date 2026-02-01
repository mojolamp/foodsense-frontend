/**
 * Feature Flags Tests
 *
 * @module lib/featureFlags.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getBooleanFeatureFlag,
  getAllFlags,
  isFeatureEnabled,
  enableFeature,
  disableFeature,
  setMultipleFlags,
  resetAllFlags,
  type FeatureFlags,
} from './featureFlags'

describe('getBooleanFeatureFlag', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return default value when env var is undefined', () => {
    expect(getBooleanFeatureFlag('UNDEFINED_VAR')).toBe(false)
    expect(getBooleanFeatureFlag('UNDEFINED_VAR', true)).toBe(true)
  })

  it('should return true for truthy values', () => {
    const truthyValues = ['1', 'true', 'yes', 'y', 'on', 'TRUE', 'Yes', 'Y', 'ON']

    truthyValues.forEach((value) => {
      process.env.TEST_FLAG = value
      expect(getBooleanFeatureFlag('TEST_FLAG')).toBe(true)
    })
  })

  it('should return false for falsy values', () => {
    const falsyValues = ['0', 'false', 'no', 'n', 'off', 'FALSE', 'No', 'N', 'OFF']

    falsyValues.forEach((value) => {
      process.env.TEST_FLAG = value
      expect(getBooleanFeatureFlag('TEST_FLAG')).toBe(false)
    })
  })

  it('should return default value for unrecognized values', () => {
    process.env.TEST_FLAG = 'maybe'
    expect(getBooleanFeatureFlag('TEST_FLAG')).toBe(false)
    expect(getBooleanFeatureFlag('TEST_FLAG', true)).toBe(true)
  })

  it('should handle whitespace', () => {
    process.env.TEST_FLAG = '  true  '
    expect(getBooleanFeatureFlag('TEST_FLAG')).toBe(true)
  })
})

describe('getAllFlags', () => {
  beforeEach(() => {
    vi.stubGlobal('window', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return default flags on server side', () => {
    const flags = getAllFlags()

    expect(flags.review_queue_enhanced_hotkeys).toBe(false)
    expect(flags.monitoring_time_picker_v2).toBe(false)
    expect(flags.empty_states_v2).toBe(false)
    expect(flags.product_virtual_scrolling).toBe(false)
  })

  it('should return all flag keys', () => {
    const flags = getAllFlags()
    const expectedKeys: (keyof FeatureFlags)[] = [
      'review_queue_enhanced_hotkeys',
      'monitoring_time_picker_v2',
      'empty_states_v2',
      'product_virtual_scrolling',
      'filter_ux_v2',
      'mobile_rwd_fixes',
      'data_quality_trends',
      'screen_reader_enhancements',
      'a11y_automation',
    ]

    expectedKeys.forEach((key) => {
      expect(flags).toHaveProperty(key)
    })
  })
})

describe('getAllFlags with localStorage', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should merge localStorage flags with defaults', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ review_queue_enhanced_hotkeys: true })
    )

    const flags = getAllFlags()
    expect(flags.review_queue_enhanced_hotkeys).toBe(true)
    expect(flags.monitoring_time_picker_v2).toBe(false)
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid json')

    const flags = getAllFlags()
    expect(flags.review_queue_enhanced_hotkeys).toBe(false)
  })
})

describe('isFeatureEnabled', () => {
  beforeEach(() => {
    vi.stubGlobal('window', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return false for disabled features', () => {
    expect(isFeatureEnabled('review_queue_enhanced_hotkeys')).toBe(false)
  })
})

describe('enableFeature', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should enable a feature in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null)

    enableFeature('review_queue_enhanced_hotkeys')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({ review_queue_enhanced_hotkeys: true })
    )
  })

  it('should preserve existing flags when enabling', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ monitoring_time_picker_v2: true })
    )

    enableFeature('review_queue_enhanced_hotkeys')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({
        monitoring_time_picker_v2: true,
        review_queue_enhanced_hotkeys: true,
      })
    )
  })
})

describe('enableFeature on server side', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should do nothing on server side', () => {
    enableFeature('review_queue_enhanced_hotkeys')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })
})

describe('disableFeature', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should disable a feature in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ review_queue_enhanced_hotkeys: true })
    )

    disableFeature('review_queue_enhanced_hotkeys')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({ review_queue_enhanced_hotkeys: false })
    )
  })
})

describe('disableFeature on server side', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should do nothing on server side', () => {
    disableFeature('review_queue_enhanced_hotkeys')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })
})

describe('setMultipleFlags', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should set multiple flags at once', () => {
    localStorageMock.getItem.mockReturnValue(null)

    setMultipleFlags({
      review_queue_enhanced_hotkeys: true,
      monitoring_time_picker_v2: true,
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({
        review_queue_enhanced_hotkeys: true,
        monitoring_time_picker_v2: true,
      })
    )
  })

  it('should merge with existing flags', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ empty_states_v2: true })
    )

    setMultipleFlags({
      review_queue_enhanced_hotkeys: true,
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({
        empty_states_v2: true,
        review_queue_enhanced_hotkeys: true,
      })
    )
  })
})

describe('setMultipleFlags on server side', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should do nothing on server side', () => {
    setMultipleFlags({ review_queue_enhanced_hotkeys: true })
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
  })
})

describe('resetAllFlags', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should remove featureFlags from localStorage', () => {
    resetAllFlags()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('featureFlags')
  })
})

describe('resetAllFlags on server side', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should do nothing on server side', () => {
    resetAllFlags()
    expect(localStorageMock.removeItem).not.toHaveBeenCalled()
  })
})
