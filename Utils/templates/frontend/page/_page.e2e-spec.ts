describe('[e2e] Page <%= name.capital %>', () => {
    beforeEach(() => {
        browser.get('/<%= name.kebab %>');
        browser.waitForAngular();
        // element.all(by.css('nav > a')).get(1).click();
    });

    it('should have correct feature heading', () => {
        let el = element(by.css('header'));
        expect(el.getText()).toEqual('<%= name.capital %> Header');
    });
});