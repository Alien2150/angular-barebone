"use strict";

import "../../typings/browser.d";
import {Application} from "./Application";
import {ExampleService} from "./services/ExampleService";
import "./components/Example";

Application.service("ExampleService", ExampleService);