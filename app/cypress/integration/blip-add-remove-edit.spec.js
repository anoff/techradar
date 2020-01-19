/// <reference types="Cypress" />
const getBackend = function () { return cy.window().its('backend') }

const chainStart = Symbol()
cy.all = function (...commands) {
  const _ = Cypress._
  const chain = cy.wrap(null, { log: false })
  const stopCommand = _.find(cy.queue.commands, {
    attributes: { chainerId: chain.chainerId }
  })
  const startCommand = _.find(cy.queue.commands, {
    attributes: { chainerId: commands[0].chainerId }
  })
  const p = chain.then(() => {
    return _(commands)
      .map(cmd => {
        return cmd[chainStart]
          ? cmd[chainStart].attributes
          : _.find(cy.queue.commands, {
            attributes: { chainerId: cmd.chainerId }
          }).attributes
      })
      .concat(stopCommand.attributes)
      .slice(1)
      .flatMap(cmd => {
        return cmd.prev.get('subject')
      })
      .value()
  })
  p[chainStart] = startCommand
  return p
}

context('Blip editing', function () {
  beforeEach(function () {
    cy.exec('node cypress/support/wipe-firestore.js')
    cy.visit('/')
    getBackend()
      .as('backend')
    cy.get('@backend')
      .then(backend => backend.test.login())
      .as('userId')
    cy.get('[data-cy="loadingDialog"]', { timeout: 10e3 }).should('be.visible')
    cy.get('[data-cy="loadingDialog"]').should('not.be.visible')
    cy.get('[data-cy=cookie-banner] button').click()
    cy.all(cy.get('@backend'), cy.get('@userId'))
      .spread((backend, userId) => backend.test.getRadarIdByUserId(userId))
      .as('radarId')
    cy.get('@radarId')
      .then(radarId => cy.visit(`/^${radarId}`))
  })

  it('adding a new blip', function () {
    const blipTitle = 'blipA'
    cy.get('[data-cy="blip-title"]').should('not.exist')
    cy.get('[data-cy="blip-new-button"]').click()
    cy.get('[data-cy="blip-new-title"]').type(blipTitle)
    cy.get('[data-cy="blip-new-category"]').click({ force: true })
    cy.get('.menuable__content__active .v-list-item__content:visible')
      .then(listItems => listItems[0].click())
    cy.get('[data-cy="blip-new-level"]').click({ force: true })
    cy.get('.menuable__content__active .v-list-item__content:visible')
      .then(listItems => listItems[0].click())
    cy.get('[data-cy="blip-new-submit"]').click()
    cy.get('[data-cy="blip-title"]').contains(blipTitle).should('exist')
  })

  it.only('removing a blip', function () {
    cy.all(
      cy.get('@backend'),
      cy.fixture('blips'),
      cy.get('@radarId')
    )
      .spread((backend, blipsFix, radarId) => {
        return Promise.all(blipsFix.blips.slice(0, 3).map(b => backend.test.addBlip(b)))
      })
  })
})
