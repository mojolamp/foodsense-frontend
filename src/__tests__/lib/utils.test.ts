import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  describe('Basic functionality', () => {
    it('should merge single class', () => {
      const result = cn('text-red-500')
      expect(result).toBe('text-red-500')
    })

    it('should merge multiple classes', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined values', () => {
      const result = cn('text-red-500', undefined, 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle null values', () => {
      const result = cn('text-red-500', null, 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle false values', () => {
      const result = cn('text-red-500', false, 'bg-blue-500')
      expect(result).toBe('text-red-500 bg-blue-500')
    })
  })

  describe('Tailwind merge functionality', () => {
    it('should merge conflicting tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should merge conflicting padding classes', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toBe('p-8')
    })

    it('should merge conflicting margin classes', () => {
      const result = cn('m-2', 'm-4')
      expect(result).toBe('m-4')
    })

    it('should handle px and py separately', () => {
      const result = cn('px-4', 'py-2')
      expect(result).toBe('px-4 py-2')
    })

    it('should merge background colors', () => {
      const result = cn('bg-white', 'bg-gray-100')
      expect(result).toBe('bg-gray-100')
    })

    it('should handle responsive variants', () => {
      const result = cn('text-sm', 'md:text-lg', 'lg:text-xl')
      expect(result).toBe('text-sm md:text-lg lg:text-xl')
    })
  })

  describe('Conditional classes', () => {
    it('should handle conditional classes with && operator', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('should handle false conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class')
    })

    it('should handle ternary conditional classes', () => {
      const isError = true
      const result = cn('base-class', isError ? 'text-red-500' : 'text-green-500')
      expect(result).toBe('base-class text-red-500')
    })
  })

  describe('Object syntax', () => {
    it('should handle object syntax for conditional classes', () => {
      const result = cn({ 'text-red-500': true, 'bg-blue-500': false })
      expect(result).toBe('text-red-500')
    })

    it('should handle mixed string and object syntax', () => {
      const result = cn('base-class', { 'active-class': true, 'inactive-class': false })
      expect(result).toBe('base-class active-class')
    })
  })

  describe('Array syntax', () => {
    it('should handle array of classes', () => {
      const classes = ['text-red-500', 'bg-blue-500']
      const result = cn(classes)
      expect(result).toBe('text-red-500 bg-blue-500')
    })

    it('should handle nested arrays', () => {
      const result = cn(['text-red-500', ['bg-blue-500', 'p-4']])
      expect(result).toBe('text-red-500 bg-blue-500 p-4')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle typical component styling pattern', () => {
      const variant = 'primary'
      const size = 'lg'
      const disabled = false

      const result = cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        {
          'bg-primary text-white': variant === 'primary',
          'bg-secondary text-gray-900': variant === 'secondary',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        disabled && 'opacity-50 cursor-not-allowed'
      )

      expect(result).toContain('inline-flex')
      expect(result).toContain('items-center')
      expect(result).toContain('bg-primary')
      expect(result).toContain('h-12')
      expect(result).toContain('px-6')
      expect(result).not.toContain('opacity-50')
    })

    it('should properly merge complex button styles', () => {
      const result = cn(
        'px-4 py-2 bg-blue-500 text-white rounded',
        'hover:bg-blue-600',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )

      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
      expect(result).toContain('focus:ring-2')
      expect(result).toContain('disabled:opacity-50')
    })
  })
})
