describe('<%= name.kebab %>App E2E test', () => {
  beforeEach(() => {
    browser.get('/');
  });

  it('should have a title', () => {
    expect(browser.getTitle()).toEqual('<%= name.capital %> App');
  });

  it('should have <tov-nav>', () => {
    expect(element(by.css('<%= name.kebab %>-app top-nav')).isPresent()).toBe(true);
  });

  it('should have <sidebar-menu>', () => {
    expect(element(by.css('<%= name.kebab %>-app sidebar-menu')).isPresent()).toBe(true);
  });

  it('should have a main title', () => {
    expect(element(by.css('#main h1')).getText()).toEqual('<%= name.capital %> App');
  });

  it('should have a main div', () => {
    expect(element(by.css('<%= name.kebab %>-app div#main')).isPresent()).toBe(true);
  });
});
