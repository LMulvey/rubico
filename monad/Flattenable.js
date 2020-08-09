/* rubico v1.5.0
 * https://github.com/a-synchronous/rubico
 * (c) 2019-2020 Richard Tong
 * rubico may be freely distributed under the MIT license.
 */

'use strict'

const Instance = require('./Instance')

const { isArray, isObject, isSet, isIterable } = Instance

const objectValuesIterator = function*(x) {
  for (const k in x) {
    yield x[k]
  }
}

/*
 * @synopsis
 * isFlattenable(x any) -> boolean
 */
const isFlattenable = x => isArray(x) || isSet(x)

/*
 * @name Flattenable
 *
 * @synopsis
 * new Flattenable(x Array|Set) -> Flattenable
 *
 * @catchphrase
 * Flattening things
 */
const Flattenable = function(x) {
  if (!isFlattenable(x)) {
    throw new TypeError(`cannot convert ${x} to Flattenable`)
  }
  this.value = x
}

/*
 * @synopsis
 * Flattenable.isFlattenable(x any) -> boolean
 */
Flattenable.isFlattenable = isFlattenable

/*
 * @synopsis
 * <T any>genericFlatten(
 *   method string,
 *   y Array,
 *   x Array<Iterable<T>|Object<T>|T>,
 * ) -> y Array<T>
 *
 * <T any>genericFlatten(
 *   method string,
 *   y Set,
 *   x Set<Iterable<T>|Object<T>|T>,
 * ) -> y Set<T>
 */
const genericFlatten = (method, y, x) => {
  const add = y[method].bind(y)
  for (const xi of x) {
    if (isIterable(xi)) {
      for (const v of xi) add(v)
    } else if (isObject(xi)) {
      for (const v of objectValuesIterator(xi)) add(v)
    } else {
      add(xi)
    }
  }
  return y
}

/*
 * @synopsis
 * <T any>Flattenable.flatten(
 *   x Array<Iterable<T>|Object<T>|T>,
 * ) -> Array<T>
 *
 * <T any>Flattenable.flatten(
 *   x Set<Iterable<T>|Object<T>|T>,
 * ) -> Set<T>
 */
// Flattenable.flatten = x => isArray(x) ? arrayFlatten(x) : setFlatten(x)
Flattenable.flatten = x => (isArray(x)
  ? genericFlatten('push', [], x)
  : genericFlatten('add', new Set(), x))

/*
 * @synopsis
 * <T any>Flattenable(
 *   x Array<Iterable<T>|Object<T>|T>,
 * ).flatten() -> Array<T>
 *
 * <T any>Flattenable()(
 *   x Set<Iterable<T>|Object<T>|T>,
 * ).flatten() -> Set<T>
 */
Flattenable.prototype.flatten = function() {
  const x = this.value
  return (isArray(x)
    ? genericFlatten('push', [], x)
    : genericFlatten('add', new Set(), x))
}

module.exports = Flattenable