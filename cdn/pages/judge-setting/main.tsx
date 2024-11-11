import "vite/modulepreload-polyfill";
import "../shared/style.less";

import { render } from "preact";
import type React from "react";

import { App } from "./App";

const dist = document.getElementById("app-root")!;
dist.innerHTML = "";

render(<App />, dist);
