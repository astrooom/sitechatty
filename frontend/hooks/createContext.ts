import { createContext as createReactContext, useContext as useReactContext } from "react";

import type { Context, Provider } from "react";

export type CreateContextOptions<T> = {
  name?: string;
  strict?: boolean;
  hookName?: string;
  providerName?: string;
  errorMessage?: string;
  defaultValue?: T;
};

export type CreateContextReturn<T> = [Provider<T>, () => T, Context<T>];

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
}

export function createContext<T>(options: CreateContextOptions<T> = {}) {
  const { name, strict = true, hookName = "useContext", providerName = "Provider", errorMessage } = options;

  const Context = createReactContext<T | undefined>(undefined);

  Context.displayName = name;

  function useContext() {
    const context = useReactContext(Context);

    if (!context && strict) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
      error.name = "ContextError";
      // Error.captureStackTrace?.(error, useContext); // TODO
      throw error;
    }

    return context;
  }

  return [Context.Provider, useContext, Context] as CreateContextReturn<T>;
}
