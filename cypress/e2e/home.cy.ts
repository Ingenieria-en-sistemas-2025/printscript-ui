import {CreateSnippet} from "../../src/utils/snippet";

describe('Home', () => {
    beforeEach(() => {
        cy.loginToAuth0(
            Cypress.env("AUTH0_USERNAME"),
            Cypress.env("AUTH0_PASSWORD")
        )
    })

    // before(() => {
    //   process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
    //   process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
    // })

    it('Renders home', () => {
        // Usamos Cypress.env() para cy.visit
        cy.visit(Cypress.env("FRONTEND_URL"))

        /* ==== Generated with Cypress Studio ==== */
        cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
        cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
        cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
        cy.get('.css-jie5ja').click();
    });

    it('Renders the first snippets', () => {
        cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/all*`).as('list');
        cy.visit(Cypress.env('FRONTEND_URL'));

        //reintenta hasta 5 veces si devuelve 502 u otro error
        let attempts = 0;
        const maxAttempts = 5;

        function waitForSuccess() {
            attempts++;
            cy.wait('@list', { timeout: 20000 }).then(({ response }) => {
                const status = response?.statusCode ?? 0;
                cy.log(`Intento ${attempts}: /snippets/all → ${status}`);

                if (status === 200) {
                    //bien osea paso
                    cy.get('[data-testid="snippet-row"]', { timeout: 15000 })
                      .should('have.length.greaterThan', 0)
                      .and('have.length.lessThan', 50);
                } else if (attempts < maxAttempts) {
                    //reintento, espero y desp reintento
                    cy.wait(2000).then(waitForSuccess);
                } else {
                    //fallo desp de reintentar
                    throw new Error(`/snippets/all falló después de ${maxAttempts} intentos (último status: ${status})`);
                }
            });
        }

        waitForSuccess();
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

        //tomo el Bearer real desde un XHR del SPA
        cy.getBearerFromApi().then((token) => {
            const base = Cypress.env('CYPRESS_BACKEND_URL');

            //creo el snippet
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

                //busco por nombre con reintentos hasta que /all responda 200
                cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/all*`).as('search');

                cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input')
                  .clear()
                  .type(snippetData.name + '{enter}');

                let attempts = 0;
                const maxAttempts = 5;

                function waitSearch200() {
                    attempts++;
                    cy.wait('@search', { timeout: 20000 }).then(({ response }) => {
                        const status = response?.statusCode ?? 0;
                        cy.log(`Intento ${attempts}: /snippets/all (search) → ${status}`);

                        if (status === 200) {
                            cy.get('[data-testid="snippet-row"]', { timeout: 15000 })
                              .should('contain.text', snippetData.name);
                        } else if (attempts < maxAttempts) {
                            cy.wait(2000).then(waitSearch200);
                        } else {
                            throw new Error(
                              `/snippets/all (search) falló después de ${maxAttempts} intentos (último status: ${status})`,
                            );
                        }
                    });
                }

                waitSearch200();
            });
        });
    });
});