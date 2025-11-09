

export function loginViaAuth0Ui(username: string, password: string) {
    // App landing page redirects to Auth0.
    cy.visit('/')

    // Login on Auth0.
    cy.origin(
        Cypress.env('auth0_domain'),
        { args: { username, password } },
        ({ username, password }) => {
            cy.get('input#username').type(username)
            cy.get('input#password').type(password, { log: false })
            cy.contains('button[value=default]', 'Continue').click()
        }
    )

    cy.url().should('equal', 'https://printscript-prod.duckdns.org/')
    cy.contains('button', 'Log Out').should('be.visible', { timeout: 10000 });
}