(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .controller('pizzaController', pizzaController);

    pizzaController.$inject = ['pizzaFactory','$q','$http'];

    /* @ngInject */
    function pizzaController(pizzaFactory,$q,$http) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'pizzaController';

        vm.ingredients = [];
        var allPizzas = [];
        vm.base = [];
        vm.indexedIngredients = {};
        vm.pizzas = []; // will be always be mapped to getSortedPizzas();

        activate();

        vm.wishedIngredients = {
            items: [],
            excluded: []
        };
        vm.wishedIngredients.add = function (ingredientName) {
            if (!_.includes(vm.wishedIngredients.items, ingredientName)) {
                vm.wishedIngredients.items.push(ingredientName);
                vm.pizzas = getSortedPizzas();
            }
        };
        vm.wishedIngredients.remove = function (ingredientName) {
            if (_.includes(vm.wishedIngredients.items, ingredientName)) {
                vm.wishedIngredients.items.splice(_.indexOf(vm.wishedIngredients.items, ingredientName), 1);
                vm.pizzas = getSortedPizzas();
            }
        };
        vm.wishedIngredients.exclude = function (ingredientName) {
            if (!_.includes(vm.wishedIngredients.excluded, ingredientName)) {
                vm.wishedIngredients.excluded.push(ingredientName);
                vm.pizzas = getSortedPizzas();
            }
        };
        vm.wishedIngredients.removeExcluded = function (ingredientName) {
            if (_.includes(vm.wishedIngredients.excluded, ingredientName)) {
                vm.wishedIngredients.excluded.splice(_.indexOf(vm.wishedIngredients.excluded, ingredientName), 1);
                vm.pizzas = getSortedPizzas();
            }
        };

        vm.wishedBases = {
            items: [0, 1]
        };
        vm.wishedBases.set = function (baseId) {
            vm.wishedBases.items = [baseId];
            vm.pizzas = getSortedPizzas();
        };
        vm.wishedBases.clear = function () {
            vm.wishedBases.items = [0, 1];
            vm.pizzas = getSortedPizzas();
        };

        vm.getMatchColor = function (matchScore) {
            var intensity = 55 + (matchScore * 2);
            var color = (intensity > 55) ? 'rgb(0,' + intensity + ',0)' : 'rgb(200,200,200)';
            var style = {"background-color": color};
            return style;
        };
        vm.getIngredientPresentClass = function (ingredient) {
            if (_.includes(vm.wishedIngredients.items, ingredient)) return "isWished";
            if (_.includes(vm.wishedIngredients.excluded, ingredient)) return "isExcluded";
        };

        /////////////////////////////////

        function getSortedPizzas() {
            console.log("getSortedPizzas()");
            var scoredPizzas = _.map(allPizzas, function (pizza, id) {
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
                var pizza = allPizzas[pizzaIndex];
                if (vm.wishedIngredients.items.length > 0 | vm.wishedIngredients.excluded.length > 0) {

                    var ingredients, commonIngredients;
                    if (true) {
                        var computedPizzaIngredients = computeIngredients(pizza.ingredients);
                        var computedWishedIngredients = computeIngredients(vm.wishedIngredients.items);
                        ingredients = _.union(computedPizzaIngredients, computeIngredients(vm.base[pizza.base].ingredients));
                        commonIngredients = _.intersection(computedWishedIngredients, ingredients);
                        percentage = Math.round(100 * commonIngredients.length / computedWishedIngredients.length);
                        if (_.intersection(vm.wishedIngredients.excluded, computedPizzaIngredients).length > 0) percentage = percentage - 101;
                    } else {
                        ingredients = _.union(pizza.ingredients, vm.base[pizza.base].ingredients);
                        commonIngredients = _.intersection(vm.wishedIngredients.items, ingredients);
                        percentage = Math.round(100 * commonIngredients.length / vm.wishedIngredients.items.length);
                    }

                    if (isNaN(percentage)) percentage = 0;

                }
                if (_.indexOf(vm.wishedBases.items, pizza.base) < 0) percentage = percentage - 101;

                return percentage;

                function computeIngredients(ingredients) {
                    var computedIngredients = _.chain(ingredients)
                        .map(function (ingredient) {
                            return vm.indexedIngredients[ingredient];
                        })
                        .flatten()
                        .union()
                        .value();
                    return computedIngredients;
                }
            }

        }

        ////////////////

        function activate() {
            pizzaFactory.then(function(service) {
                console.log("pizzaFactory returned...");
                vm.ingredients = service.ingredients;
                allPizzas = service.allPizzas;
                vm.base = service.base;
                vm.indexedIngredients = service.indexedIngredients;
                vm.pizzas = getSortedPizzas();
            });
        }
    }


})();