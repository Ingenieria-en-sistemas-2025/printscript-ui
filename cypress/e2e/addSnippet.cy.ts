describe('Add snippet tests', () => {
    beforeEach(() => {
        cy.loginToAuth0(
          Cypress.env('AUTH0_USERNAME'),
          Cypress.env('AUTH0_PASSWORD')
        );
    });

    it('Can add snippets manually', () => {
        cy.visit('/');

        cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/config/filetypes`).as('filetypes');
        cy.intercept('POST', `${Cypress.env('BACKEND_URL')}/snippets`).as('postSnippet');

        cy.get('.css-9jay18 > .MuiButton-root').click();
        cy.contains('li[role="menuitem"]', /create snippet/i).click();

        cy.wait('@filetypes');

        cy.get('#name').clear().type(`Some snippet name ${Date.now()}`);

        cy.get('#demo-simple-select').click();
        cy.get('[data-testid="menu-option-printscript"]').click();

        cy.get('[data-testid="add-snippet-code-editor"]')
          .click()
          .type('const snippet: string = "some snippet";{enter}println(snippet);', { parseSpecialCharSequences: true });

        cy.get('[data-testid="SaveIcon"]').click({ force: true });

        cy.wait('@postSnippet').then(({ response }) => {
            expect(response?.statusCode).to.eq(201);
            expect(response?.body).to.include.keys('id', 'name', 'content', 'language');
        });
    });

    it('Can add snippets via file', () => {
        cy.visit('/');

        cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/config/filetypes`).as('filetypes');
        cy.intercept('POST', `${Cypress.env('BACKEND_URL')}/snippets/file`).as('postFile');

        cy.get('.css-9jay18 > .MuiButton-root').click();
        cy.contains('li[role="menuitem"]', /load snippet from file/i).click(); //para que el modal se inicialice como FILE_UPLOAD

        cy.wait('@filetypes');

        // Cargar archivo .prs (fixture)
        cy.get('[data-testid="upload-file-input"]')
          .selectFile('cypress/fixtures/example_ps.prs', { force: true });

        // Evitar 409: si tu UI usa filename por default, lo pisamos
        cy.get('#name').clear().type(`example_ps_${Date.now()}`);

        // Guardar (mismo botón)
        cy.get('[data-testid="SaveIcon"]').click({ force: true });

        // Afirmaciones
        cy.wait('@postFile').then(({ response }) => {
            expect(response?.statusCode).to.eq(201);
            expect(response?.body).to.include.keys('id', 'name', 'content', 'language');
        });
    });
});