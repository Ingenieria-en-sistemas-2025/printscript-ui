describe('Add snippet tests', () => {
  const FRONTEND = Cypress.env('FRONTEND_URL') || '/';
  const BACKEND  = Cypress.env('BACKEND_URL');

  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env('AUTH0_USERNAME'),
      Cypress.env('AUTH0_PASSWORD')
    );

    cy.intercept('GET', `${BACKEND}/snippets/config/filetypes`).as('filetypes');
    cy.intercept('GET', `${BACKEND}/snippets/all*`).as('list');

    cy.intercept('GET', `${BACKEND}/snippets/users*`, [
      { userId: 'admin-id', name: 'admin@gmail.com', email: 'admin@gmail.com' },
      { userId: 'dev-id',   name: 'developer@gmail.com', email: 'developer@gmail.com' },
    ]).as('users');

    cy.intercept('POST', `${BACKEND}/snippets/share`, (req) => {
      expect(req.body).to.have.keys(['snippetId', 'userId', 'permissionType']);
      req.reply({
        statusCode: 200,
        body: {},
      });
    }).as('shareSnippet');

    cy.visit(FRONTEND);

    cy.wait('@list', { timeout: 20000 }).then(({ response }) => {
      expect(response?.statusCode).to.eq(200);

      cy.get('[data-testid="snippet-row"]', { timeout: 15000 })
        .should('have.length.greaterThan', 0)
        .and('have.length.lessThan', 50);
    });

    cy.intercept('GET', `${BACKEND}/snippets/*`).as('detail');
    cy.intercept('GET', `${BACKEND}/snippets/*/tests`).as('tests');

    cy.get('[data-testid="snippet-row"]', { timeout: 15000 }).first().click();

    cy.wait(['@detail', '@tests']);
  });

  it('Can share a snippet', () => {
    cy.get('[aria-label="Share"]').click();
    cy.contains('Share your snippet', { timeout: 10000 }).should('be.visible');

    cy.wait('@users');

    // Autocomplete
    cy.get('input[aria-autocomplete="list"]', { timeout: 10000 })
      .first()
      .click({ force: true })
      .type('admin', { delay: 0 });

    cy.get('ul[role="listbox"]', { timeout: 10000 })
      .should('be.visible')
      .contains('admin@gmail.com')
      .click();

    cy.get('[data-testid="share-confirm-btn"]', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.wait('@shareSnippet').its('response.statusCode').should('eq', 200);
  });

  it('Can run snippets', () => {
    cy.intercept('POST', `${BACKEND}/snippets/*/run`).as('run');
    cy.get('[data-testid="PlayArrowIcon"]', { timeout: 10000 }).click();
    cy.wait('@run').its('response.statusCode').should('eq', 200);

    cy.get('.npm__react-simple-code-editor__textarea', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });

  it('Can format snippets', () => {
    cy.intercept('POST', `${BACKEND}/snippets/run/*/format`).as('format');
    cy.get('[data-testid="ReadMoreIcon"]', { timeout: 10000 }).click();
    cy.wait('@format').its('response.statusCode').should('eq', 200);
  });

  it('Can save snippets', () => {
    cy.intercept('PUT', `${BACKEND}/snippets/*`).as('save');
    cy.get('.npm__react-simple-code-editor__textarea', { timeout: 10000 })
      .first()
      .click()
      .type(' // E2E edit', { delay: 0 });
    cy.get('[data-testid="SaveIcon"]', { timeout: 10000 }).click();
    cy.wait('@save').its('response.statusCode').should('be.oneOf', [200, 204]);
  });

  it('Can delete snippets', () => {
    cy.intercept('DELETE', `${BACKEND}/snippets/*`).as('delete');
    cy.get('[data-testid="DeleteIcon"]', { timeout: 10000 }).click();
    cy.contains('button', /^delete|confirm|ok|sí$/i, { timeout: 10000 }).click({ force: true });
    cy.wait('@delete').its('response.statusCode').should('be.oneOf', [200, 204]);
  });
});
