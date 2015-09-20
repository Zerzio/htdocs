(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .controller('pizzaController', pizzaController);

    pizzaController.$inject = ['pizzaFilterFactory','pizzaBasketFactory'];

    /* @ngInject */
    function pizzaController(pizzaFilterFactory,pizzaBasketFactory) {
        /* jshint validthis: true */
        var vm = this;

        vm.title = 'pizzaController';
        vm.loaded = 'loading';

        vm.basket = pizzaBasketFactory;

        vm.ingredients = [];

        vm.base = [];

        vm.pizzas = []; // will be always be mapped to getSortedPizzas();

        vm.wishedIngredients = {
            items: [],
            excluded: []
        };
        vm.wishedBases = {
            items: [0, 1]
        };

        activate();

        vm.wishedIngredients.add = function (ingredientName) {
            if (!_.includes(vm.wishedIngredients.items, ingredientName)) {
                vm.wishedIngredients.items.push(ingredientName);
                vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
            }
        };
        vm.wishedIngredients.remove = function (ingredientName) {
            if (_.includes(vm.wishedIngredients.items, ingredientName)) {
                vm.wishedIngredients.items.splice(_.indexOf(vm.wishedIngredients.items, ingredientName), 1);
                vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
            }
        };
        vm.wishedIngredients.exclude = function (ingredientName) {
            if (!_.includes(vm.wishedIngredients.excluded, ingredientName)) {
                vm.wishedIngredients.excluded.push(ingredientName);
                vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
            }
        };
        vm.wishedIngredients.removeExcluded = function (ingredientName) {
            if (_.includes(vm.wishedIngredients.excluded, ingredientName)) {
                vm.wishedIngredients.excluded.splice(_.indexOf(vm.wishedIngredients.excluded, ingredientName), 1);
                vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
            }
        };

        vm.wishedBases.set = function (baseId) {
            vm.wishedBases.items = [baseId];
            vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
        };
        vm.wishedBases.clear = function () {
            vm.wishedBases.items = [0, 1];
            vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);
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

        ////////////////

        function activate() {
            pizzaFilterFactory.isReady.then(function() {
                console.log("pizzaFactory returned...");
                vm.ingredients = pizzaFilterFactory.ingredients;
                vm.base = pizzaFilterFactory.base;
                vm.pizzas = pizzaFilterFactory.getSortedPizzas(vm.wishedIngredients,vm.wishedBases);

                vm.loaded = 'loaded';
            });
        }
    }


})();