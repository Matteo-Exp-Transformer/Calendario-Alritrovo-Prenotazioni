const normalizeName = (name: string): string => name.toLowerCase().trim()

export const isCaraffeDrinkPremium = (itemName: string): boolean => {
  const nameLower = normalizeName(itemName)
  return nameLower.includes('premium') &&
    (nameLower.includes('caraffe') || nameLower.includes('drink'))
}

export const isCaraffeDrinkStandard = (itemName: string): boolean => {
  const nameLower = normalizeName(itemName)
  if (isCaraffeDrinkPremium(itemName)) {
    return false
  }

  return (nameLower.includes('caraffe') || nameLower.includes('drink')) &&
    !nameLower.includes('premium') &&
    !nameLower.includes('caffè') &&
    !nameLower.includes('caffe')
}

