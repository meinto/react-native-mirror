import React from 'react'
import Mirror from './Mirror'

import renderer from 'react-test-renderer'

it('renders without crashing', () => {
  const rendered = renderer.create(<Mirror />).toJSON()
  expect(rendered).toBeTruthy()
})