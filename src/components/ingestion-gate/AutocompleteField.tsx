'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useEntitySuggest } from '@/hooks/useIngestionGate'

interface EntitySuggestion {
  canonical_name: string
  match_type: 'ALIAS' | 'HYBRID' | 'VECTOR_FALLBACK'
  score: number
}

interface AutocompleteFieldProps {
  value: string
  onChange: (value: string) => void
  namespace: 'ingredients' | 'allergens' | 'additives'
  placeholder?: string
  onSelect?: (suggestion: EntitySuggestion) => void
}

export function AutocompleteField({
  value,
  onChange,
  namespace,
  placeholder,
  onSelect,
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { data: suggestions, isLoading } = useEntitySuggest(query, namespace)

  useEffect(() => {
    setQuery(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange(newValue)
    setShowSuggestions(newValue.length > 0)
  }

  const handleSelectSuggestion = (suggestion: EntitySuggestion) => {
    onChange(suggestion.canonical_name)
    setShowSuggestions(false)
    if (onSelect) {
      onSelect(suggestion)
    }
  }

  const getMatchTypeBadgeVariant = (matchType: string) => {
    if (matchType === 'ALIAS') return 'default'
    if (matchType === 'HYBRID') return 'secondary'
    return 'outline'
  }

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(query.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
      />
      
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">載入中...</div>
          ) : (
            suggestions.map((suggestion: EntitySuggestion, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.canonical_name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      分數: {(suggestion.score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Badge variant={getMatchTypeBadgeVariant(suggestion.match_type)}>
                    {suggestion.match_type}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}









