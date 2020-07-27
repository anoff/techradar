/// <reference types="Cypress" />
require('../support/cy-all')

context('Radar metadata', () => {
  before(() => {
    const testUser = 'rick'
    cy.clean()
    cy.gohome()
    cy.login(testUser, { reroute: true, fetchRadarId: true })

    cy.log('Adding 4 dummy blips')
    cy.all(
      cy.getTestUtils(),
      cy.fixture('blips'),
      cy.get('@radarId')
    )
      .spread((utils, blipsFix, radarId) => {
        return Promise.all(blipsFix.blips.map(b => utils.addBlip(b)))
      })
    cy.get('header').contains('Me', { timeout: 5e3 }).click()
    cy.get('[data-cy="radarSvg"]').should('be.visible')
  })

  it('changes title via settings', () => {
    const newTitle = 'rick sanchez was here: ' + Date.now()
    cy.get('[data-cy="app-nav-toggle"]').click({ force: true })
    cy.get('[data-cy="radar-tab-settings"]').click()
    cy.get('[data-cy="radar-settings-title-field"]').focus()
    cy.get('[data-cy="radar-settings-title-field"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-title-field"]').type(newTitle)
    cy.wait(50)
    cy.get('[data-cy="radar-tab-radar"]').focus()
    cy.wait(200)
    cy.get('[data-cy="radar-settings-title-save"]').click()
    cy.wait(800)
    cy.get('[data-cy="radar-tab-radar"]').click()
    cy.wait(300)
    cy.get('[data-cy="app-title"]').should('have.text', newTitle)
  })

  it('changes levels via settings', () => {
    const field0 = 'best' + Date.now()
    const field1 = 'grandson' + Date.now()
    const field2 = 'of' + Date.now()
    const field3 = 'all' + Date.now()

    cy.get('[data-cy="app-nav-toggle"]').click({ force: true })
    cy.get('[data-cy="radar-tab-settings"]').click()
    cy.get('[data-cy="radar-settings-levels-field-0"]').focus()
    cy.get('[data-cy="radar-settings-levels-field-0"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-levels-field-0"]').type(field0)
    cy.get('[data-cy="radar-settings-levels-field-1"]').focus()
    cy.get('[data-cy="radar-settings-levels-field-1"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-levels-field-1"]').type(field1)
    cy.get('[data-cy="radar-settings-levels-field-2"]').focus()
    cy.get('[data-cy="radar-settings-levels-field-2"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-levels-field-2"]').type(field2)
    cy.get('[data-cy="radar-settings-levels-field-3"]').focus()
    cy.get('[data-cy="radar-settings-levels-field-3"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-levels-field-3"]').type(field3)
    cy.get('[data-cy="radar-tab-radar"]').focus()
    cy.wait(50)
    cy.get('[data-cy="radar-settings-levels-save"]').click()
    cy.wait(400)
    cy.get('[data-cy="radar-tab-radar"]').click()
    cy.wait(300)
    cy.get('[data-cy="radarSvg"]').within($form => {
      cy.get('.label-0').should('have.text', field0)
      cy.get('.label-1').should('have.text', field1)
      cy.get('.label-2').should('have.text', field2)
      cy.get('.label-3').should('have.text', field3)
    })
  })

  it('changes categories via settings', () => {
    const field0 = 'summer' + Date.now()
    const field1 = 'ruined' + Date.now()
    const field2 = 'everything' + Date.now()
    const field3 = 'today' + Date.now()

    cy.get('[data-cy="app-nav-toggle"]').click({ force: true })
    cy.get('[data-cy="radar-tab-settings"]').click()
    cy.get('[data-cy="radar-settings-categories-field-0"]').focus()
    cy.get('[data-cy="radar-settings-categories-field-0"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-categories-field-0"]').type(field0)
    cy.get('[data-cy="radar-settings-categories-field-1"]').focus()
    cy.get('[data-cy="radar-settings-categories-field-1"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-categories-field-1"]').type(field1)
    cy.get('[data-cy="radar-settings-categories-field-2"]').focus()
    cy.get('[data-cy="radar-settings-categories-field-2"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-categories-field-2"]').type(field2)
    cy.get('[data-cy="radar-settings-categories-field-3"]').focus()
    cy.get('[data-cy="radar-settings-categories-field-3"]').type('{selectall}{del}')
    cy.get('[data-cy="radar-settings-categories-field-3"]').type(field3)
    cy.get('[data-cy="radar-tab-radar"]').focus()
    cy.wait(50)
    cy.get('[data-cy="radar-settings-categories-save"]').click()
    cy.wait(400)
    cy.get('[data-cy="radar-tab-radar"]').click()
    cy.wait(300)
    cy.get('.radarlegend:visible').within($form => {
      cy.get('.radar-legend > .legendCategory.category-0').should('have.text', field0)
      cy.get('.radar-legend > .legendCategory.category-1').should('have.text', field1)
      cy.get('.radar-legend > .legendCategory.category-2').should('have.text', field2)
      cy.get('.radar-legend > .legendCategory.category-3').should('have.text', field3
    })
  })
})
