import React, { FC, useMemo } from 'react'
import useProduct from 'vtex.product-context/useProduct'
import { withToast } from 'vtex.styleguide'

import AddToCartButton from './AddToCartButton'
import { mapCatalogItemToCart } from './modules/catalogItemToCart'
import { AssemblyOptions } from './modules/assemblyOptions'

interface Props {
  isOneClickBuy: boolean
  available: boolean
  disabled: boolean
  customToastUrl: string
  customOneClickBuyLink: string
  showToast: Function
  selectedSeller: Seller | undefined
}

function checkAvailability(
  isEmptyContext: boolean,
  seller: Seller | undefined,
  availableProp: Props['available']
) {
  if (isEmptyContext) {
    return false
  }
  if (availableProp != null) {
    return availableProp
  }

  const availableProductQuantity =
    seller?.commertialOffer?.AvailableQuantity

  return Boolean(availableProductQuantity)
}

function checkDisabled(
  isEmptyContext: boolean,
  assemblyOptions: AssemblyOptions,
  disabledProp: Props['disabled']
) {
  if (isEmptyContext) {
    return true
  }
  if (disabledProp != null) {
    return disabledProp
  }

  const groupsValidArray =
    (assemblyOptions?.areGroupsValid &&
      Object.values(assemblyOptions.areGroupsValid)) ||
    []
  const areAssemblyGroupsValid = groupsValidArray.every(Boolean)

  return !areAssemblyGroupsValid
}

const Wrapper: FC<Props> = ({
  isOneClickBuy,
  available,
  disabled,
  customToastUrl,
  showToast,
  customOneClickBuyLink,
  selectedSeller
}) => {
  const productContext: ProductContextState = useProduct()
  const isEmptyContext = Object.keys(productContext).length === 0

  const product = productContext?.product
  const selectedItem = productContext?.selectedItem
  const assemblyOptions = productContext?.assemblyOptions
  const seller = selectedSeller ? selectedSeller : productContext?.selectedItem?.sellers[0]
  const selectedQuantity =
    productContext?.selectedQuantity != null
      ? productContext.selectedQuantity
      : 1

  const skuItems = useMemo(
    () =>
      mapCatalogItemToCart({
        product,
        selectedItem,
        selectedQuantity,
        selectedSeller: seller,
        assemblyOptions,
      }),
    [assemblyOptions, product, selectedItem, selectedQuantity, seller]
  )

  const isAvailable = checkAvailability(
    isEmptyContext,
    seller,
    available
  )

  const isDisabled = checkDisabled(isEmptyContext, assemblyOptions, disabled)

  const areAllSkuVariationsSelected =
    !isEmptyContext && productContext?.skuSelector.areAllVariationsSelected

  return (
    <AddToCartButton
      allSkuVariationsSelected={areAllSkuVariationsSelected}
      skuItems={skuItems}
      available={isAvailable}
      isOneClickBuy={isOneClickBuy}
      disabled={isDisabled}
      customToastUrl={customToastUrl}
      showToast={showToast}
      customOneClickBuyLink={customOneClickBuyLink}
    />
  )
}

export default withToast(Wrapper)
