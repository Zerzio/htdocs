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

        vm.content = pizzaFactory.content;

        vm.ingredients = [];
        var allPizzas = pizzaFactory.content.allPizzas;
        vm.base = [];
        vm.indexedIngredients = {};
        vm.pizzas = []; // will be always be mapped to getSortedPizzas();

        var test = pizzaFactory.init().then(function(q) {
            console.log("pizzaFactory.init returned...");
            vm.ingredients = pizzaFactory.content.ingredients;
            allPizzas = pizzaFactory.content.allPizzas;
            vm.base = pizzaFactory.content.base;
            vm.indexedIngredients = pizzaFactory.content.indexedIngredients;
            vm.pizzas = getSortedPizzas();
        });

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

        activate();

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

            //init();

            // fetch all data
            function init() {
                console.log("init()");
                var pizzaPromise = $http.get('data/ingredients.json').
                    then(function (response) {
                        console.log("received Ingredients");
                        vm.base = response.data.bases;
                        vm.ingredients = response.data.ingredients;

                        _.map(vm.ingredients, function (ingredient) {
                            computeFamily(ingredient, []);
                        });

                        function computeFamily(ingredient, parentFamily) {
                            ingredient.family = ingredient.family || _.clone(parentFamily);
                            ingredient.family.push(ingredient.name);
                            var childFamily = _.clone(ingredient.family);
                            if (ingredient.as) {
                                _.map(ingredient.as, function (childIngredient) {
                                    computeFamily(childIngredient, childFamily);
                                });
                            }
                        }

                        _.map(vm.ingredients, function (ingredient) {
                            indexFamily(ingredient, vm.indexedIngredients);
                        });

                        function indexFamily(ingredient, index) {
                            index[ingredient.name] = ingredient.family;
                            if (ingredient.as) {
                                _.map(ingredient.as, function (childIngredient) {
                                    indexFamily(childIngredient, index);
                                });
                            }
                        }

                    });

                var ingredientsPromise = $http.get('data/pizzas.json').
                    then(function (response) {
                        console.log("received Pizzas");
                        allPizzas = response.data;
                    });

                $q.all([pizzaPromise, ingredientsPromise]).
                    then(function (a) {
                        console.log("received all");
                        console.log(a);
                        vm.pizzas = getSortedPizzas();
                    });
            }

        }
    }


})();