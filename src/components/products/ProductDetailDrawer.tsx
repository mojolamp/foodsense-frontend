'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useProductDetail, useUpdateProductTier } from '@/hooks/useProducts'
import { Product } from '@/types/product'
import TierBadge from './TierBadge'
import IngredientStructureTree from './IngredientStructureTree'

interface Props {
  product: Product
  onClose: () => void
}

export default function ProductDetailDrawer({ product, onClose }: Props) {
  const { data, isLoading } = useProductDetail(product.id)
  const { mutate: updateTier, isPending: isUpdating } = useUpdateProductTier()

  const handleTierUpdate = (tier: 'A' | 'B' | 'C') => {
    updateTier({ productId: product.id, tier })
  }

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="bg-blue-600 px-6 py-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-xl font-semibold text-white">
                          產品詳情
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="text-white hover:text-gray-200"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 px-6 py-6">
                      {isLoading ? (
                        <div className="text-center text-gray-600">載入中...</div>
                      ) : data ? (
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              基本資訊
                            </h3>
                            <dl className="grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-sm text-gray-500">產品名稱</dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900">
                                  {data.golden_record.product_name}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-500">品牌</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {data.golden_record.brand || '-'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-500">Tier</dt>
                                <dd className="mt-1">
                                  <TierBadge tier={data.golden_record.tier} />
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm text-gray-500">素食類型</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {data.golden_record.vegan_type || '-'}
                                </dd>
                              </div>
                            </dl>

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                更新 Tier
                              </label>
                              <div className="flex gap-2">
                                {(['A', 'B', 'C'] as const).map((tier) => (
                                  <button
                                    key={tier}
                                    onClick={() => handleTierUpdate(tier)}
                                    disabled={isUpdating || data.golden_record.tier === tier}
                                    className={`
                                      px-4 py-2 rounded-lg font-medium
                                      ${data.golden_record.tier === tier
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }
                                      disabled:opacity-50
                                    `}
                                  >
                                    Tier {tier}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {data.golden_record.ingredients_structure && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                成分樹狀結構
                              </h3>
                              <IngredientStructureTree
                                structure={data.golden_record.ingredients_structure}
                              />
                            </div>
                          )}

                          {data.golden_record.ingredients_flat_tokens && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                成分 Tokens
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {data.golden_record.ingredients_flat_tokens.map((token, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                                  >
                                    {token}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {data.golden_record.additive_markers &&
                           data.golden_record.additive_markers.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                添加物標記
                              </h3>
                              <div className="space-y-2">
                                {data.golden_record.additive_markers.map((additive, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">{additive.name}</p>
                                      {additive.e_code && (
                                        <p className="text-sm text-gray-500">{additive.e_code}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {additive.is_upf_marker && (
                                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                                          UPF
                                        </span>
                                      )}
                                      <span className={`
                                        px-2 py-1 text-xs font-medium rounded
                                        ${additive.risk_level === 0 ? 'bg-green-100 text-green-800' :
                                          additive.risk_level === 1 ? 'bg-yellow-100 text-yellow-800' :
                                          additive.risk_level === 2 ? 'bg-orange-100 text-orange-800' :
                                          'bg-red-100 text-red-800'}
                                      `}>
                                        風險 {additive.risk_level}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              原始來源 ({data.variants.length} 個)
                            </h3>
                            <div className="space-y-3">
                              {data.variants.map((variant) => (
                                <div
                                  key={variant.variant_id}
                                  className="p-4 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {variant.original_name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        來源: {variant.source}
                                      </p>
                                    </div>
                                    {variant.url && (
                                      <a
                                        href={variant.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        查看原始網頁 →
                                      </a>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <strong>原始成分:</strong>{' '}
                                    {variant.original_ingredients}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">無法載入產品詳情</div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


