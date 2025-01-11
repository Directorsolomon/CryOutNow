describe('Prayer Groups', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
  });

  it('allows creating a new prayer group', () => {
    cy.visit('/groups');
    cy.get('[data-testid="create-group-button"]').click();

    // Fill in group details
    cy.get('[data-testid="group-name-input"]').type('Test Prayer Group');
    cy.get('[data-testid="group-description-input"]').type('A group for testing');
    cy.get('[data-testid="group-privacy-select"]').select('public');
    cy.get('[data-testid="group-max-members-input"]').type('10');
    cy.get('[data-testid="create-group-submit"]').click();

    // Verify group was created
    cy.url().should('include', '/groups/');
    cy.get('[data-testid="group-name"]').should('contain', 'Test Prayer Group');
    cy.get('[data-testid="group-description"]').should('contain', 'A group for testing');
  });

  it('displays list of available groups', () => {
    cy.visit('/groups');
    
    // Verify groups are displayed
    cy.get('[data-testid="group-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="group-card"]').first().within(() => {
      cy.get('[data-testid="group-name"]').should('be.visible');
      cy.get('[data-testid="group-description"]').should('be.visible');
      cy.get('[data-testid="group-member-count"]').should('be.visible');
    });
  });

  it('allows joining a public group', () => {
    cy.visit('/groups');
    
    // Find and click on a public group
    cy.get('[data-testid="group-card"]')
      .filter(':contains("Public")')
      .first()
      .click();

    // Join the group
    cy.get('[data-testid="join-group-button"]').click();
    
    // Verify membership
    cy.get('[data-testid="member-status"]').should('contain', 'Member');
    cy.get('[data-testid="group-members-list"]').should('include.text', 'test@example.com');
  });

  it('allows creating and managing prayer sessions', () => {
    // Create a new group first
    cy.createGroup('Session Test Group', 'Testing sessions').then((groupId) => {
      cy.visit(`/groups/${groupId}`);
      
      // Create a new session
      cy.get('[data-testid="create-session-button"]').click();
      cy.get('[data-testid="session-title-input"]').type('Prayer Meeting');
      cy.get('[data-testid="session-description-input"]').type('Weekly prayer meeting');
      cy.get('[data-testid="session-datetime-input"]').type('2025-01-01T10:00');
      cy.get('[data-testid="session-duration-input"]').type('60');
      cy.get('[data-testid="create-session-submit"]').click();

      // Verify session was created
      cy.get('[data-testid="session-card"]').should('contain', 'Prayer Meeting');
      cy.get('[data-testid="session-datetime"]').should('contain', '2025-01-01');
    });
  });

  it('allows creating and viewing prayer requests', () => {
    // Create a new group first
    cy.createGroup('Prayer Request Test Group', 'Testing prayer requests').then((groupId) => {
      cy.visit(`/groups/${groupId}`);
      
      // Create a new prayer request
      cy.get('[data-testid="create-prayer-request-button"]').click();
      cy.get('[data-testid="prayer-request-title-input"]').type('Test Prayer Request');
      cy.get('[data-testid="prayer-request-content-input"]').type('Please pray for this test');
      cy.get('[data-testid="create-prayer-request-submit"]').click();

      // Verify prayer request was created
      cy.get('[data-testid="prayer-request-card"]').should('contain', 'Test Prayer Request');
      cy.get('[data-testid="prayer-request-content"]').should('contain', 'Please pray for this test');
    });
  });

  it('allows sharing group details', () => {
    // Create a new group first
    cy.createGroup('Share Test Group', 'Testing sharing').then((groupId) => {
      cy.visit(`/groups/${groupId}`);
      
      // Click share button
      cy.get('[data-testid="share-button"]').click();
      
      // Verify share options are displayed
      cy.get('[data-testid="share-menu"]').should('be.visible');
      cy.get('[data-testid="share-copy-link"]').should('be.visible');
      cy.get('[data-testid="share-facebook"]').should('be.visible');
      cy.get('[data-testid="share-twitter"]').should('be.visible');
    });
  });

  it('handles group privacy settings correctly', () => {
    // Create a private group
    cy.createGroup('Private Group', 'Testing privacy', 'private').then((groupId) => {
      // Logout current user
      cy.logout();
      
      // Login as different user
      cy.login('other@example.com', 'password123');
      
      // Try to access private group
      cy.visit(`/groups/${groupId}`);
      
      // Verify access is denied
      cy.get('[data-testid="access-denied-message"]').should('be.visible');
      cy.get('[data-testid="group-details"]').should('not.exist');
    });
  });

  it('enforces member limits', () => {
    // Create a group with max 1 member (only creator)
    cy.createGroup('Limited Group', 'Testing limits', 'public', 1).then((groupId) => {
      // Logout current user
      cy.logout();
      
      // Login as different user
      cy.login('other@example.com', 'password123');
      cy.visit(`/groups/${groupId}`);
      
      // Try to join full group
      cy.get('[data-testid="join-group-button"]').click();
      
      // Verify join is prevented
      cy.get('[data-testid="error-message"]').should('contain', 'group is full');
      cy.get('[data-testid="member-status"]').should('not.exist');
    });
  });
}); 