describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
          Cypress.env("AUTH0_USERNAME"),
          Cypress.env("AUTH0_PASSWORD")
        )
    })

    it('Can add snippets manually', () => {
        cy.visit("/")

        // Intercept puntual al create por editor (JSON)
        cy.intercept(
          'POST',
          `${Cypress.env("BACKEND_URL")}/snippets`
        ).as('postSnippet')

        cy.get('.css-9jay18 > .MuiButton-root').click()
        cy.get('.MuiList-root > [tabindex="0"]').click()

        // Evita 409
        cy.get('#name').clear().type(`Some snippet name ${Date.now()}`)
        cy.get('#demo-simple-select').click()
        cy.get('[data-testid="menu-option-printscript"]').click()

        cy.get('[data-testid="add-snippet-code-editor"]').click()
          .type(`const snippet: string = "some snippet";\nprintln(snippet);`)

        cy.get('[data-testid="SaveIcon"]').click({ force: true })

        cy.wait('@postSnippet').then(({ response }) => {
            expect(response?.statusCode).to.eq(201) // <- 201 Created
            expect(response?.body).to.include.keys('id', 'name', 'content', 'language')
        })
    })

    it('Can add snippets via file', () => {
        cy.visit("/")

        cy.intercept('POST', `${Cypress.env('BACKEND_URL')}/snippets`).as('postFile')

        cy.get('.css-9jay18 > .MuiButton-root').click()
        cy.get('.MuiList-root > [tabindex="0"]').click()

        // Evita 409 (la UI suele tomar el filename)
        cy.get('#name').clear().type(`example_ps_${Date.now()}`)

        cy.get('[data-testid="upload-file-input"]')
          .selectFile('cypress/fixtures/example_ps.prs', { force: true })

        cy.get('[data-testid="SaveIcon"]').click({ force: true })

        cy.wait('@postFile').its('response.statusCode').should('eq', 201) // <- 201
    })
})