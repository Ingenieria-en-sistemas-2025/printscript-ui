describe('Protected routes test', () => {
    it('should redirect to login when accessing a protected route unauthenticated', () => {
        cy.visit('/');

        cy.origin(
            Cypress.env('auth0_domain'),
            () => {
            }
        );
    });

    it('should display login content', () => {
        cy.visit('/');

        cy.origin(
            Cypress.env('auth0_domain'),
            () => {
                cy.contains('Log in').should('exist');
                cy.contains('Password').should('exist');
            }
        )
    });

    it('should not redirect to login when the user is already authenticated', () => {
        cy.loginToAuth0(
            Cypress.env("AUTH0_USERNAME"),
            Cypress.env("AUTH0_PASSWORD")
        )

        cy.visit('/');

        cy.wait(1000)

        cy.url().should('include', Cypress.env('FRONTEND_URL'))
            .and('not.include', Cypress.env('auth0_domain'));
    });

})
