"use strict";

import * as angular from "angular";

export function Component(moduleOrName:string | ng.IModule, selector:string, options:{
    controllerAs?:string,
    bindings?:any,
    template?:string,
    templateUrl?:string,
    transclude?:any
}) {
    "use strict";
    return (controller:Function) => {
        const module = typeof moduleOrName === "string" ? angular.module(moduleOrName) : moduleOrName;
        module.component(selector, angular.extend(options, {controller: controller}));
    };
}