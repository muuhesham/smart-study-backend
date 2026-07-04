export {};

import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
    }
  }
}

declare module "http" {
  interface IncomingMessage {
      user?: {
        _id: string;
      };
  }
}
