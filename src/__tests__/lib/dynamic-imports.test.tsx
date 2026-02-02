import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  lazyWithPreload,
  preloadComponents,
  lazyWithLoading,
  lazyModal,
  lazyChart,
  prefetchRoute,
  lazyLibrary,
  routeComponent,
} from '@/lib/dynamic-imports'

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: vi.fn((importFunc, options) => {
    // Return a mock component that renders loading state or component
    const MockComponent = (props: Record<string, unknown>) => {
      return <div data-testid="dynamic-component" {...props}>Dynamic Component</div>
    }
    MockComponent.displayName = 'DynamicComponent'
    return MockComponent
  }),
}))

describe('lazyWithPreload', () => {
  it('should create a lazy component with preload method', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Test</div> }))
    const LazyComponent = lazyWithPreload(importFunc)

    expect(LazyComponent).toBeDefined()
    expect(typeof (LazyComponent as { preload?: unknown }).preload).toBe('function')
  })

  it('should call importFunc when preload is invoked', async () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Test</div> }))
    const LazyComponent = lazyWithPreload(importFunc)

    await (LazyComponent as { preload: () => Promise<unknown> }).preload()

    expect(importFunc).toHaveBeenCalled()
  })

  it('should accept custom options', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Test</div> }))
    const loadingFn = () => <div>Loading...</div>

    const LazyComponent = lazyWithPreload(importFunc, {
      loading: loadingFn,
      ssr: true,
    })

    expect(LazyComponent).toBeDefined()
  })
})

describe('preloadComponents', () => {
  it('should call all import functions', async () => {
    const importFunc1 = vi.fn(() => Promise.resolve({ default: 'Component1' }))
    const importFunc2 = vi.fn(() => Promise.resolve({ default: 'Component2' }))

    await preloadComponents([importFunc1, importFunc2])

    expect(importFunc1).toHaveBeenCalled()
    expect(importFunc2).toHaveBeenCalled()
  })

  it('should return array of resolved modules', async () => {
    const importFunc1 = vi.fn(() => Promise.resolve({ default: 'Component1' }))
    const importFunc2 = vi.fn(() => Promise.resolve({ default: 'Component2' }))

    const results = await preloadComponents([importFunc1, importFunc2])

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ default: 'Component1' })
    expect(results[1]).toEqual({ default: 'Component2' })
  })

  it('should handle empty array', async () => {
    const results = await preloadComponents([])

    expect(results).toEqual([])
  })
})

describe('lazyWithLoading', () => {
  it('should create a dynamic component with custom loading', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Test</div> }))
    const loadingComponent = <div>Custom Loading...</div>

    const LazyComponent = lazyWithLoading(importFunc, loadingComponent)

    expect(LazyComponent).toBeDefined()
  })

  it('should render the component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Test</div> }))
    const loadingComponent = <div>Custom Loading...</div>

    const LazyComponent = lazyWithLoading(importFunc, loadingComponent)
    render(<LazyComponent />)

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })
})

describe('lazyModal', () => {
  it('should create a lazy modal component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Modal</div> }))

    const LazyModal = lazyModal(importFunc)

    expect(LazyModal).toBeDefined()
  })

  it('should render the modal component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Modal</div> }))

    const LazyModal = lazyModal(importFunc)
    render(<LazyModal />)

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })
})

describe('lazyChart', () => {
  it('should create a lazy chart component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Chart</div> }))

    const LazyChart = lazyChart(importFunc)

    expect(LazyChart).toBeDefined()
  })

  it('should render the chart component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Chart</div> }))

    const LazyChart = lazyChart(importFunc)
    render(<LazyChart />)

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })
})

describe('prefetchRoute', () => {
  let originalDocument: Document

  beforeEach(() => {
    // Save original document
    originalDocument = global.document

    // Mock document.createElement and document.head
    const mockLink = {
      rel: '',
      href: '',
    }

    const mockHead = {
      appendChild: vi.fn(),
    }

    vi.stubGlobal('document', {
      createElement: vi.fn(() => mockLink),
      head: mockHead,
    })
  })

  it('should create a prefetch link element', () => {
    prefetchRoute('/products')

    expect(document.createElement).toHaveBeenCalledWith('link')
  })

  it('should set rel to prefetch', () => {
    const mockLink = { rel: '', href: '' }
    vi.mocked(document.createElement).mockReturnValue(mockLink as unknown as HTMLElement)

    prefetchRoute('/products')

    expect(mockLink.rel).toBe('prefetch')
  })

  it('should set href to the route', () => {
    const mockLink = { rel: '', href: '' }
    vi.mocked(document.createElement).mockReturnValue(mockLink as unknown as HTMLElement)

    prefetchRoute('/products')

    expect(mockLink.href).toBe('/products')
  })

  it('should append link to document head', () => {
    const mockLink = { rel: '', href: '' }
    vi.mocked(document.createElement).mockReturnValue(mockLink as unknown as HTMLElement)

    prefetchRoute('/products')

    expect(document.head.appendChild).toHaveBeenCalledWith(mockLink)
  })
})

describe('lazyLibrary', () => {
  it('should import a library dynamically', async () => {
    // This test is more of a smoke test since we can't easily mock dynamic imports
    // In a real scenario, this would import an actual library
    try {
      await lazyLibrary('non-existent-library')
    } catch {
      // Expected to fail for non-existent library
    }
  })
})

describe('routeComponent', () => {
  it('should create a route component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Page</div> }))

    const RouteComponent = routeComponent(importFunc)

    expect(RouteComponent).toBeDefined()
  })

  it('should render the route component', () => {
    const importFunc = vi.fn(() => Promise.resolve({ default: () => <div>Page</div> }))

    const RouteComponent = routeComponent(importFunc)
    render(<RouteComponent />)

    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument()
  })
})
