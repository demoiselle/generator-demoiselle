describe('E2E Test - <%= name.capital %>Component', () => {
  // beforeEach(() => {
  //   browser.get('/');
  // });

  it('should have <<%= name.kebab %>>', () => {
    let <%= name.camel %> = element(by.css('<%= name.kebab %>-app <%= name.kebab %>'));
    expect(<%= name.camel %>.isPresent()).toEqual(true);
  });
});
