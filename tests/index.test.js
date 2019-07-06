import { Selector } from 'testcafe';

fixture`Getting Started`
  .page`http://localhost:9090/index.html`;

test('Q4GD: index page test', async test => {
  const header = Selector('#page-header');
  const content = Selector('#page-content');
  const footer = Selector('#page-footer');

  await test
    .expect(header.exists && header.visible).eql(true)
    .expect(content.exists && content.visible).eql(true)
    .expect(footer.exists && footer.visible).eql(true);
});
