(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .controller('pizzaBasketController', pizzaBasketController);

    pizzaBasketController.$inject = ['pizzaBasketFactory'];

    /* @ngInject */
    function pizzaBasketController(pizzaBasketFactory) {
        /* jshint validthis: true */
        var vm = this;

        vm.title = 'pizzaBasketController';
        vm.loaded = 'loading';

        vm.basket = pizzaBasketFactory;

        activate();

        ////////////////

        function activate() {
            pizzaBasketFactory.isReady.then(function() {
                console.log("pizzaBasketFactory returned...");

                vm.loaded = 'loaded';
            });
        }
    }


})();