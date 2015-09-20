(function () {
    'use strict';

    angular
        .module('PizzaFinder')
        .factory('pizzaBasketFactory', pizzaBasketFactory);

    pizzaBasketFactory.$inject = ['pizzaFactory','$q'];

    /* @ngInject */
    function pizzaBasketFactory(pizzaFactory, $q) {

        var isReady = $q.defer();

        var service = {
            "isReady": isReady.promise,
            "basket": [],
            "add" : add,
            "price" : 0
        };

        var _allPizzas = [];

        activate();

        return service;

        ////////////////////////////////////

        function add(pizza,size) {
            var item = _.findWhere(service.basket, { 'id':pizza.id });
            if (item) {
                item.quantity[size] ++;
            } else {
                item = _.cloneDeep(pizza);
                item.quantity = {
                    "small" : 0,
                    "big" : 0
                };
                item.quantity[size] = 1;
                service.basket.push(item);
            }
            updatePrice();
            return item;
        }

        function updatePrice() {
            service.price = _.reduce(service.basket, function(total, item) {
                total += item.quantity.small * item.price.small;
                total += item.quantity.big * item.price.big;
                return total;
            },0)
        }

        ////////////////////////////////////

        function activate() {
            pizzaFactory.then(function(pf) {
                console.log("pizzaFactory returned...");

                service.ingredients = pf.ingredients;

                _allPizzas = pf.allPizzas;

                isReady.resolve();

            });
        }
    }
})();