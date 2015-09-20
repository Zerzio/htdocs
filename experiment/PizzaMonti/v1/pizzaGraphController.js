(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .controller('pizzaGraphController', pizzaGraphController);

    pizzaGraphController.$inject = ['pizzaGraphFactory'];

    /* @ngInject */
    function pizzaGraphController(pizzaGraphFactory) {
        /* jshint validthis: true */
        var vm = this;

        vm.title = 'pizzaGraphController';
        vm.loaded = 'loading';

        activate();

        ////////////////

        function activate() {
            pizzaGraphFactory.isReady.then(function() {
                console.log("pizzaGraphFactory returned...");

                vm.loaded = 'loaded';

                vm.extendedPizzas = pizzaGraphFactory.extendedPizzas;
                vm.parent2child = pizzaGraphFactory.parent2child;
            });
        }
    }


})();