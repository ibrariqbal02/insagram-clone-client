import { TextDecoder, TextEncoder } from "node:util";

// jsdom doesn't implement the Encoding API; react-router-dom (among others)
// expects these globals to exist.
Object.assign(globalThis, { TextEncoder, TextDecoder });

import "@testing-library/jest-dom";
