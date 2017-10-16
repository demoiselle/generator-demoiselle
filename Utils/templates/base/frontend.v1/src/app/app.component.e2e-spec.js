describe('angular-4App E2E test', () => {
  beforeEach(() => {
    browser.get('/');
  });

  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('Angular4 App');
  });

  // it('should have <tov-nav>', () => {
  //   expect(element(by.css('navbar navbar-default navbar-inverse')).isPresent()).toBe(true);
  // });

  // it('should have <sidebar-menu>', () => {
  //   expect(element(by.css('angular-4-app sidebar-menu')).isPresent()).toBe(true);
  // });

  // it('should have a main title', () => {
  //   expect(element(by.css('#main h1')).getText()).toEqual('Angular4 App');
  // });

  // it('should have a main div', () => {
  //   expect(element(by.css('angular-4-app div#main')).isPresent()).toBe(true);
  // });
});
