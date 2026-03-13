import { describe, expect, test } from 'vitest'
import type { SelectedMenuItem } from '@/types/menu'
import {
  getCaraffeSurchargeForSelection,
  isCaraffeDrinkPremium,
  isCaraffeDrinkStandard,
} from './caraffePricing'

const makeItem = (name: string): SelectedMenuItem => ({
  id: name,
  name,
  price: 10,
  category: 'bevande',
})

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

  test('surcharge is 0 when no caraffe items are selected', () => {
    const items: SelectedMenuItem[] = [
      makeItem('Pizza Margherita'),
      makeItem('Farinata'),
    ]

    expect(getCaraffeSurchargeForSelection(items)).toBe(0)
  })

  test('surcharge is 2€ when only standard caraffe is selected', () => {
    const items: SelectedMenuItem[] = [
      makeItem('Caraffe drink'),
      makeItem('Pizza Margherita'),
    ]

    expect(getCaraffeSurchargeForSelection(items)).toBe(2)
  })

  test('surcharge is 2€ when only premium caraffe is selected', () => {
    const items: SelectedMenuItem[] = [
      makeItem('Caraffe Premium'),
      makeItem('Pizza Margherita'),
    ]

    expect(getCaraffeSurchargeForSelection(items)).toBe(2)
  })

  test('surcharge is 4€ when both standard and premium caraffe are selected', () => {
    const items: SelectedMenuItem[] = [
      makeItem('Caraffe drink'),
      makeItem('Caraffe Premium'),
    ]

    expect(getCaraffeSurchargeForSelection(items)).toBe(4)
  })
})

