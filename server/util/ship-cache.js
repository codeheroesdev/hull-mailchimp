import Promise from "bluebird";

/**
 * This is a wrapper over https://github.com/BryanDonovan/node-cache-manager
 * to manage ship cache storage.
 * It is responsible for handling cache key for every ship,
 * and support namespaces.
 */
export default class ShipCache {

  /**
   * @param {Object} cache instance of cache-manager
   * @param {String} namespace name of the namespace
   */
  constructor(cache, namespace) {
    this.cache = cache;
    this.namespace = namespace || "global";
  }

  /**
   * @param {String} id the ship id
   * @return {String}
   */
  getShipKey(id) {
    return `${this.namespace}_ship-${id}`;
  }

  /**
   * Hull client calls which fetch ship settings could be wrapped with this
   * method to cache the results
   * @see https://github.com/BryanDonovan/node-cache-manager#overview
   * @param {String} id
   * @param {Function} cb callback which Promised result would be cached
   * @return {Promise}
   */
  wrap(id, cb) {
    const shipCacheKey = this.getShipKey(id);
    return this.cache.wrap(shipCacheKey, cb);
  }

  /**
   * Saves ship data to the cache
   * @param  {String} id ship id
   * @param  {Object} ship
   * @return {Promise}
   */
  set(id, ship) {
    const shipCacheKey = this.getShipKey(id);
    return Promise.resolve(this.cache.set(shipCacheKey, ship));
  }

  /**
   * Clears the ship cache
   * @param  {String} id
   * @return Promise
   */
  del(id) {
    const shipCacheKey = this.getShipKey(id);
    return Promise.resolve(this.cache.del(shipCacheKey));
  }
}
