/**
 * Provider for getting token data from a Token List.
 *
 * @export
 * @interface IRouteCachingProvider
 */
import { Protocol } from '@uniswap/router-sdk';
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';

import { CacheMode } from './model';
import { CachedRoutes } from './model/cached-routes';

export abstract class IRouteCachingProvider {
  public readonly getCachedRoute = (
    chainId: number,
    amount: CurrencyAmount<Currency>,
    quoteToken: Token,
    tradeType: TradeType,
    protocols: Protocol[],
    blockNumber: number,
  ): Promise<CachedRoutes | undefined> => {
    return this._getCachedRoute(chainId, amount, quoteToken, tradeType, protocols, blockNumber).then((cachedRoute) =>
      Promise.resolve(this.validateCachedNotExpired(cachedRoute, blockNumber))
    );
  };

  private validateCachedNotExpired(
    cachedRoutes: CachedRoutes | undefined,
    blockNumber: number
  ): CachedRoutes | undefined {
    return cachedRoutes?.notExpired(blockNumber) ? cachedRoutes : undefined;
  }

  public readonly setCachedRoute = (cachedRoutes: CachedRoutes): Promise<boolean> => {
    cachedRoutes.cacheMode = this._getCacheMode(cachedRoutes);
    cachedRoutes.blocksToLive = this._getBlocksToLive(cachedRoutes);

    return this._setCachedRoute(cachedRoutes);
  };

  /**
   * Abstract Methods
   */
  protected abstract _getCachedRoute(
    chainId: number,
    amount: CurrencyAmount<Currency>,
    quoteToken: Token,
    tradeType: TradeType,
    protocols: Protocol[],
    blockNumber: number
  ): Promise<CachedRoutes | undefined>


  protected abstract _setCachedRoute(cachedRoutes: CachedRoutes): Promise<boolean>

  protected abstract _getCacheMode(cachedRoutes: CachedRoutes): CacheMode

  protected abstract _getBlocksToLive(cachedRoutes: CachedRoutes): number


}
