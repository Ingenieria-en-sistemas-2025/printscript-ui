import {CreateSnippet} from "../../src/utils/snippet";

describe('Home', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            Cypress.env("AUTH0_USERNAME"),
            Cypress.env("AUTH0_PASSWORD")
        )
    })

    it('Renders home', () => {
        cy.visit(Cypress.env("FRONTEND_URL"))

        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
        cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
        cy.get('.css-jie5ja').click();
    });

    it('Renders the first snippets', () => {
        cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/all*`).as('list');

        cy.visit(Cypress.env('FRONTEND_URL'));

        cy.wait('@list', { timeout: 20000 }).then(({ response }) => {
            expect(response?.statusCode).to.eq(200);

            cy.get('[data-testid="snippet-row"]', { timeout: 15000 })
              .should('have.length.greaterThan', 0)
              .and('have.length.lessThan', 50);
        });
    });



    it('Can create snippet and then find it by name', () => {
        cy.visit(Cypress.env('FRONTEND_URL'));

        const snippetData: CreateSnippet = {
            name: `E2E ${Date.now()}`,
            content: 'println(1);',
            language: 'printscript',
            extension: 'prs',
            description: 'Snippet de prueba para E2E',
            source: 'INLINE',
            version: '1.1',
        };

        cy.getBearerFromApi().then((token) => {
            const base = Cypress.env('CYPRESS_BACKEND_URL');

            cy.request({
                method: 'POST',
                url: `${base}/snippets`,
                headers: { Authorization: `Bearer ${token}` },
                body: snippetData,
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.name).to.eq(snippetData.name);
                expect(response.body.language).to.eq(snippetData.language);
                expect(response.body).to.have.property('id');


                cy.intercept(
                  'GET',
                  `${Cypress.env('BACKEND_URL')}/snippets/all*`
                ).as('search');

                // Buscar por nombre
                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input')
                  .clear()
                  .type(snippetData.name + '{enter}');

                cy.wait('@search', { timeout: 20000 }).then(({ response }) => {
                    expect(response?.statusCode).to.eq(200);

                    cy.get('[data-testid="snippet-row"]', { timeout: 15000 })
                      .should('contain.text', snippetData.name);
                });
            });
        });
    });

});