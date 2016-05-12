"use strict";

import * as angular from "angular";

export class ExampleService {

    //@ngInject
    public constructor(protected $http:angular.IHttpService) {

    }

    public getData() {
        return this.$http.get("http://example.com/data");
    }
}