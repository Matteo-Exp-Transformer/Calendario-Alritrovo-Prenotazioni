import { describe, expect, test } from 'vitest'
import { isCaraffeDrinkPremium, isCaraffeDrinkStandard } from './caraffePricing'

describe('caraffePricing helpers', () => {
  test('detects standard and premium caraffe names', () => {
    expect(isCaraffeDrinkStandard('Caraffe drink')).toBe(true)
    expect(isCaraffeDrinkStandard('Caraffe Drink')).toBe(true)
    expect(isCaraffeDrinkStandard('Caraffe / Drink')).toBe(true)

    expect(isCaraffeDrinkPremium('Caraffe Premium')).toBe(true)
    expect(isCaraffeDrinkPremium('Caraffe Drink Premium')).toBe(true)
    expect(isCaraffeDrinkPremium('Caraffe / Drink Premium')).toBe(true)

    expect(isCaraffeDrinkStandard('Caraffe Premium')).toBe(false)
    expect(isCaraffeDrinkStandard('Caffè')).toBe(false)
    expect(isCaraffeDrinkStandard('Caffe')).toBe(false)
  })
})
