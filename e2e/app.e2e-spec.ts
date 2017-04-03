import { AuctionAppv2Page } from './app.po';

describe('auction-appv2 App', () => {
  let page: AuctionAppv2Page;

  beforeEach(() => {
    page = new AuctionAppv2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
