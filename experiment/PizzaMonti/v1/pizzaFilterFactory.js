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
            "base" : [],
            "indexedIngredients" : {},
            "pizzas" : [],
            "allPizzas": []
        };

        //var allPizzas;

        activate();

        return service;

        ////////////////

        function getSortedPizzas(wishedIngredients,wishedBases) {
            console.log("getSortedPizzas()");
            var scoredPizzas = _.map(service.allPizzas, function (pizza, id) {
                var newPizza = _.cloneDeep(pizza);
                newPizza.score = getMatchScore(id);
                return newPizza;
            });
            var sortedPizzas = _.sortBy(scoredPizzas, function (pizza) {
                return -1 * pizza.score;
            });
            return sortedPizzas;

            function getMatchScore(pizzaIndex) {
                /*
                 * Test with:
                 * Jambon, Fromage, Persillade
                 */
                var percentage = 0;
                var pizza = service.allPizzas[pizzaIndex];
                if (wishedIngredients.items.length > 0 | wishedIngredients.excluded.length > 0) {
                    /*
                     *  wishedIngredients = {
                     *      items: [],
                     *      excluded: []
                     *  }
                     *  wishedBases = {
                     *      items: [0, 1]
                     *  }
                     */

                    var ingredients, commonIngredients;
                    if (true) {
                        var computedPizzaIngredients = computeIngredients(pizza.ingredients);
                        var computedWishedIngredients = computeIngredients(wishedIngredients.items);
                        ingredients = _.union(computedPizzaIngredients, computeIngredients(service.base[pizza.base].ingredients));
                        commonIngredients = _.intersection(computedWishedIngredients, ingredients);
                        percentage = Math.round(100 * commonIngredients.length / computedWishedIngredients.length);
                        if (_.intersection(wishedIngredients.excluded, computedPizzaIngredients).length > 0) percentage = percentage - 101;
                    } else {
                        ingredients = _.union(pizza.ingredients, service.base[pizza.base].ingredients);
                        commonIngredients = _.intersection(wishedIngredients.items, ingredients);
                        percentage = Math.round(100 * commonIngredients.length / wishedIngredients.items.length);
                    }

                    if (isNaN(percentage)) percentage = 0;

                }
                if (_.indexOf(wishedBases.items, pizza.base) < 0) percentage = percentage - 101;

                return percentage;

                function computeIngredients(ingredients) {
                    var computedIngredients = _.chain(ingredients)
                        .map(function (ingredient) {
                            return service.indexedIngredients[ingredient];
                        })
                        .flatten()
                        .union()
                        .value();
                    return computedIngredients;
                }
            }

        }

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
                service.allPizzas = pf.allPizzas;
                service.ingredients = pf.ingredients;
                service.base = pf.base;
                service.indexedIngredients = pf.indexedIngredients;
                service.pizzas = getSortedPizzas(wishedIngredients,wishedBases);

                isReady.resolve();
            });
        }
    }
})();