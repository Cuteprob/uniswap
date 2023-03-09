/**
 * Provider for getting token data from a Token List.
 *
 * @export
 * @interface IRouteCachingProvider
 */
import { Protocol } from '@uniswap/router-sdk';
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';

import { ChainId } from '../../../util';

import { CacheMode } from './model';
import { CachedRoutes } from './model/cached-routes';

/**
 * Abstract class for a RouteCachingProvider.
 * Defines the base methods of how to interact with this interface, but not the implementation of how to cache.
 */
export abstract class IRouteCachingProvider {
  /**
   * Final implementation of the public `getCachedRoute` method, this is how code will interact with the implementation
   *
   * @public
   * @readonly
   * @param chainId
   * @param amount
   * @param quoteToken
   * @param tradeType
   * @param protocols
   * @param blockNumber
   */
  public readonly getCachedRoute = ( // Defined as a readonly member instead of a regular function to make it final.
    chainId: number,
    amount: CurrencyAmount<Currency>,
    quoteToken: Token,
    tradeType: TradeType,
    protocols: Protocol[],
    blockNumber: number,
  ): Promise<CachedRoutes | undefined> => {
    return this._getCachedRoute(chainId, amount, quoteToken, tradeType, protocols).then((cachedRoute) =>
      Promise.resolve(this.filterExpiredCachedRoutes(cachedRoute, blockNumber))
    );
  };

  /**
   * Final implementation of the public `setCachedRoute` method.
   * This method will set the blockToLive in the CachedRoutes object before calling the internal method to insert in cache.
   *
   * @public
   * @readonly
   * @param cachedRoutes The route to cache.
   * @returns Promise<boolean> Indicates if the route was inserted into cache.
   */
  public readonly setCachedRoute = (cachedRoutes: CachedRoutes, amount: CurrencyAmount<Currency>): Promise<boolean> => {
    // Defined as a readonly member instead of a regular function to make it final.
    cachedRoutes.blocksToLive = this._getBlocksToLive(cachedRoutes, amount);

    return this._setCachedRoute(cachedRoutes, amount);
  };

  /**
   * Returns the CacheMode for the given combination of chainId, tokenIn, tokenOut and tradetype
   *
   * @public
   * @abstract
   * @param chainId
   * @param tokenIn
   * @param tokenOut
   * @param tradeType
   * @param amount
   */
  public abstract getCacheMode(
    chainId: ChainId,
    tokenIn: string,
    tokenOut: string,
    tradeType: TradeType,
    amount: CurrencyAmount<Currency>
  ): CacheMode

  private filterExpiredCachedRoutes(
    cachedRoutes: CachedRoutes | undefined,
    blockNumber: number
  ): CachedRoutes | undefined {
    return cachedRoutes?.notExpired(blockNumber) ? cachedRoutes : undefined;
  }

  /**
   * Internal function to fetch the CachedRoute from the cache.
   * Must be implemented.
   *
   * @param chainId
   * @param amount
   * @param quoteToken
   * @param tradeType
   * @param protocols
   * @protected
   */
  protected abstract _getCachedRoute(
    chainId: number,
    amount: CurrencyAmount<Currency>,
    quoteToken: Token,
    tradeType: TradeType,
    protocols: Protocol[]
  ): Promise<CachedRoutes | undefined>

  /**
   * Internal function to insert the CachedRoute into cache.
   * Must be implemented.
   *
   * @param cachedRoutes
   * @param amount
   * @protected
   */
  protected abstract _setCachedRoute(cachedRoutes: CachedRoutes, amount: CurrencyAmount<Currency>): Promise<boolean>

  /**
   * Internal function to getBlocksToLive for a given cachedRoute.
   * This function is call before attempting to insert the route into cache.
   * Must be implemented.
   *
   * @param cachedRoutes
   * @param amount
   * @protected
   */
  protected abstract _getBlocksToLive(cachedRoutes: CachedRoutes, amount: CurrencyAmount<Currency>): number
}
