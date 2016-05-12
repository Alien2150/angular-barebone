"use strict";

import {Application} from "../Application";
import {Component} from "../decorators/Component";
import {ExampleService} from "../services/ExampleService";

@Component(Application, "example", {
    bindings: {},
    templateUrl: "example/example.html",
    controllerAs: "ctrl"
})
class ExampleController {
    public data:any;

    // @ngInject
    public constructor(private ExampleService:ExampleService) {
        this.ExampleService.getData().then((response) => {
            this.data = response.data;
        });
    }
}