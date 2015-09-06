(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .factory('pizzaFilterFactory', pizzaFilterFactory);

    pizzaFilterFactory.$inject = ['pizzaFactory','$q'];

    /* @ngInject */
    function pizzaFilterFactory(pizzaFactory, $q) {

        var isReady = $q.defer();

        var service = {
            "isReady": isReady.promise,
            "getSortedPizzas": getSortedPizzas,
            "ingredients" : [],
            "base" : []
        };

        var _indexedIngredients = {};
        var _allPizzas = [];

        activate();

        return service;

        ////////////////

        function getSortedPizzas(wishedIngredients,wishedBases) {
            console.log("getSortedPizzas()");
            var scoredPizzas = _.map(_allPizzas, function (pizza, id) {
                var newPizza = _.cloneDeep(pizza);
                newPizza.score = getMatchScore(id,wishedIngredients,wishedBases);
                return newPizza;
            });
            var sortedPizzas = _.sortBy(scoredPizzas, function (pizza) {
                return -1 * pizza.score;
            });
            return sortedPizzas;
        }

        function getMatchScore(pizzaIndex,wishedIngredients,wishedBases) {
            /*
             * Test with:
             * Jambon, Fromage, Persillade
             * Jambon, Crème,
             */
            var percentage = 0;
            var pizza = _allPizzas[pizzaIndex];
            if (wishedIngredients.items.length > 0 | wishedIngredients.excluded.length > 0) {
                /*
                 *  wishedIngredients = { items: [],excluded: [] }
                 *  wishedBases = { items: [0, 1] }
                 */
                var ingredients1 = _.union(pizza.ingredients, service.base[pizza.base].ingredients);
                var commonIngredients1 = _.intersection(wishedIngredients.items, ingredients1);
                var percentage1 = Math.round(100 * commonIngredients1.length / wishedIngredients.items.length);
                if (isNaN(percentage1)) percentage1 = 0;
                //if (_.intersection(wishedIngredients.excluded, ingredients1).length > 0) percentage1 = percentage1 - 101;

                var computedPizzaIngredients = computeIngredients(pizza.ingredients);
                var computedWishedIngredients = computeIngredients(wishedIngredients.items);
                var ingredients2 = _.union(computedPizzaIngredients, computeIngredients(service.base[pizza.base].ingredients));
                var commonIngredients2 = _.intersection(computedWishedIngredients, ingredients2);
                var percentage2 = Math.round(100 * commonIngredients2.length / computedWishedIngredients.length);
                if (isNaN(percentage2)) percentage2 = 0;
                if (_.intersection(wishedIngredients.excluded, computedPizzaIngredients).length > 0) percentage2 = percentage2 - 201;

                percentage = Math.round((percentage1 + percentage2) / 2);
            }
            if (_.indexOf(wishedBases.items, pizza.base) < 0) percentage = percentage - 101;

            return percentage;
        }

        /*
         *  Replace each ingredient by the ingredient hierarchy
         */
        function computeIngredients(ingredients) {
            var computedIngredients = _.chain(ingredients)
                .map(function (ingredient) {
                    return _indexedIngredients[ingredient];
                })
                .flatten()
                .union()
                .value();
            return computedIngredients;
        }

        ////////////////////////////////////

        function activate() {
            var wishedIngredients = {
                items: [],
                excluded: []
            };
            var wishedBases = {
                items: [0, 1]
            };

            pizzaFactory.then(function(pf) {
                console.log("pizzaFactory returned...");
                _allPizzas = pf.allPizzas;
                service.ingredients = pf.ingredients;
                service.base = pf.base;
                _indexedIngredients = pf.indexedIngredients;

                isReady.resolve();
            });
        }
    }
})();