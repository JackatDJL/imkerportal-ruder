// NOTICE: Convex doesnt want it ;(

import { err, ok, type Err, type Ok } from "neverthrow";
import posthog from "posthog-js";
import { z } from "zod";

/**
 * Im implementing another function / builder for making my neverthrow utilities compatible with Convex
 * Convex internaly makes my return as a json stringified object (makes sense they are the backend) (wonder why trpc let me do that?)
 * im thinking about just adding a _type: "ok", "err" and the data gets transfered like always through the types apiResponse<T> and apiError
 * and adding a .api() or .object() method to make it "convertable" into json
 * ill need to export a function that converts the apiObjectType<T> into apiType e.g. omits the _type and uses the neverthrow builders to create a Result Type
 * smth like result() (jsdoc needed)
 * maybe adding a createUseResult() exported function that i can like do smth like const useConvexQuery = createUseResult(useQuery(api.123.456)) that just runs result() on the query response
 *
 *
 */

// --- --- Utility Types --- ---

// --- Zod ---

/** UUID validation type using Zod */
export const uuidType = z.string().uuid();

/** Type for objects that contain an ID field */
export const identifyingInputType = z.object({
  id: uuidType,
});

// --- --- API Neverthrow Definitions --- ---

// --- Error Types ---

// -- Status and Types --

/** Enum representing different API error status categories */
export enum apiErrorStatus {
  NotFound = "NotFound",
  Forbidden = "Forbidden",
  BadRequest = "BadRequest",
  Conflict = "Conflict",
  ValidationError = "ValidationError",
  Failed = "Failed",
}

/** Detailed error types for API responses */
export enum apiErrorTypes {
  NotFound = "NotFound",

  // Forbidden types
  /** Generic forbidden error */
  Forbidden = "Forbidden",
  /** Authorization-related forbidden error */
  ForbiddenAuthorisation = "Forbidden.Authorisation",

  // BadRequest types
  /** Unknown bad request error */
  BadRequestUnknown = "BadRequest.Unknown",
  /** Internal server error */
  BadRequestInternalServerError = "BadRequest.InternalServerError",
  /** Sequential operation failure */
  //   BadRequestSequentialOperationFailure = "BadRequest.SequentialOperationFailure", // Convex auto Transactions everything
  /** Data corruption error */
  //   BadRequestCorrupted = "BadRequest.Corrupted", // no fs

  // Conflict types
  /** Duplicate data conflict */
  ConflictDuplicate = "Conflict.Duplicate",

  // ValidationError types
  /** Zod validation error */
  ValidationErrorZod = "ValidationError.Zod",
  /** Unknown validation error */
  ValidationErrorUnknown = "ValidationError.Unknown",

  // Failed types
  /** Generic failure */
  Failed = "Failed",
  /** Unknown failure */
  FailedUnknown = "Failed.Unknown",
}

// -- Error Response Type --

/** Union type representing all possible API error responses */
export type apiError =
  | {
      status: apiErrorStatus.ValidationError;
      type: apiErrorTypes.ValidationErrorZod;
      message: string;
      error: z.ZodError;
      _internal: {
        reported: boolean;
        reportable: false;
      };
    }
  | {
      status: apiErrorStatus.BadRequest;
      type:
        | apiErrorTypes.BadRequestInternalServerError
        | apiErrorTypes.BadRequestUnknown;
      message: string;
      error: unknown;
      _internal: {
        reported: boolean;
        reportable: true;
      };
    }
  | {
      status: apiErrorStatus.NotFound;
      type: apiErrorTypes.NotFound;
      message: string;
      error: null;
      _internal: {
        reported: boolean;
        reportable: false;
      };
    }
  | {
      status: apiErrorStatus.Failed;
      type: apiErrorTypes.FailedUnknown | apiErrorTypes.Failed;
      message: string;
      error?: unknown;
      _internal: {
        reported: boolean;
        reportable: true;
      };
    }
  | {
      status: apiErrorStatus;
      type: apiErrorTypes;
      message: string;
      error?: unknown;
      _internal: {
        reported: boolean;
        reportable: boolean;
      };
    };

// --- Response Types ---

// -- Status and Types --

/** Enum representing different API response status categories */
export enum apiResponseStatus {
  /** Operation completed successfully */
  Success = "Success",
  /** Operation had no effect */
  Inconsequential = "Inconsequential",
}

/** Detailed response types for API responses */
export enum apiResponseTypes {
  /** Generic success response */
  Success = "Success",
  /** Success response with no data */
  SuccessNoData = "Success.NoData",

  /** Operation had no effect */
  Inconsequential = "Inconsequential",
}

// -- Response Type --

/** Generic API response type */
export type apiResponse<T> = {
  status: apiResponseStatus;
  type?: apiResponseTypes;
  message?: string;
  data?: T extends void | undefined | null ? undefined : T;
  _internal: {
    loggable: boolean;
    logged: boolean;
  };
};

// --- --- API Utility Return Type Definitions --- ---

// --- Async Types ---

// -- Result Types --

/** Interface for API response wrapped in Result type */
export type apiType<T> = Promise<
  Ok<apiResponse<T>, apiError> | Err<never, apiError>
>;

/** Interface for API error response */
export type apiErr<T> = Promise<Err<apiResponse<T>, apiError>>;

/** Interface for API response that can never be successful */
export type apiNeverOk = Promise<Err<never, apiError>>;

/** Interface for successful API response */
export type apiOk<T> = Promise<Ok<apiResponse<T>, apiError>>;

/** Interface for API response that can never fail */
export type apiNeverFail<T> = Promise<Ok<apiResponse<T>, never>>;

// -- ObjectResult Types --

/** Interface for API response that is converted into an object and can be transerred via http */
export type apiObjectType<T> = Promise<
  (apiResponse<T> & { _type: "ok" }) | (apiError & { _type: "err" })
>;

/** Interface for API error response that is converted into an object and can be transerred via http */
export type apiObjectErr = Promise<apiError & { _type: "err" }>;

/** Interface for API response that can never be successful and is converted into an object */
export type apiObjectNeverOk = apiObjectErr;

/** Interface for successful API response that is converted into an object */
export type apiObjectOk<T> = Promise<apiResponse<T> & { _type: "ok" }>;

/** Interface for API response that can never fail and is converted into an object */
export type apiObjectNeverFail<T> = Promise<apiResponse<T> & { _type: "ok" }>;

// --- Synchronous Types ---

/** Helper type to get the resolved type of a Promise */
export type mkSync<T> = Awaited<T>;

// -- Result Types --

/** Synchronous version of apiType */
export type syncType<T> = mkSync<apiType<T>>;

/** Synchronous version of apiErr */
export type syncErr<T> = mkSync<apiErr<T>>;
/** Synchronous version of apiNeverOk */
export type syncNeverOk = mkSync<apiNeverOk>;

/** Synchronous version of apiOk */
export type syncOk<T> = mkSync<apiOk<T>>;
/** Synchronous version of apiNeverFail */
export type syncNeverFail<T> = mkSync<apiNeverFail<T>>;

// -- ObjectResult Types --

/** Synchronous version of apiObjectType */
export type syncObjectType<T> = mkSync<apiObjectType<T>>;

/** Synchronous version of apiObjectErr */
export type syncObjectErr = mkSync<apiObjectErr>;

/** Synchronous version of apiObjectNeverOk */
export type syncObjectNeverOk = mkSync<apiObjectNeverOk>;

/** Synchronous version of apiObjectOk */
export type syncObjectOk<T> = mkSync<apiObjectOk<T>>;

/** Synchronous version of apiObjectNeverFail */
export type syncObjectNeverFail<T> = mkSync<apiObjectNeverFail<T>>;

// --- --- API Neverthrow Function Utilities --- ---

// --- Object Conversion ---

/** Converts an apiType<T> into an apiObjectType<T> */
export function object<T>(input: syncType<T>): syncObjectType<T> {
  if (input.isErr()) {
    return {
      ...input.error,
      _type: "err",
    };
  }
  return {
    ...input.value,
    _type: "ok",
  };
}

/** Converts an apiObjectType<T> into an apiType<T> */
function result(input: undefined): {
  deconstruct(): {
    content(): undefined;
  };
};
function result<T>(input: syncObjectNeverFail<T>): syncNeverFail<T> & {
  deconstruct(): apiResponse<T> & {
    content(): T;
  };
};
function result(input: syncObjectNeverOk): syncNeverOk & {
  deconstruct(): apiError & {
    content(): undefined; // Changed unknown to undefined
  };
};
function result(input: undefined | null): syncNeverOk & {
  deconstruct(): apiError & {
    content(): undefined;
  };
};
function result<T>(
  input: (apiError & { _type: "err" }) | (apiResponse<T> & { _type: "ok" }),
):
  | (syncNeverFail<T> & { deconstruct(): apiResponse<T> & { content(): T } })
  | (syncNeverOk & { deconstruct(): apiError & { content(): undefined } }); // Changed unknown to undefined
function result<T>(
  input:
    | undefined
    | (apiError & { _type: "err" })
    | (apiResponse<T> & { _type: "ok" }),
):
  | (syncNeverFail<T> & { deconstruct(): apiResponse<T> & { content(): T } })
  | (syncNeverOk & { deconstruct(): apiError & { content(): undefined } });
function result<T>(
  input:
    | undefined
    | null
    | syncObjectNeverFail<T>
    | syncObjectNeverOk
    | (apiError & { _type: "err" })
    | (apiResponse<T> & { _type: "ok" }),
): // The return type should consistently be a neverthrow object + deconstruct
// (syncNeverFail<T> is Ok<apiResponse<T>, never>)
// (syncNeverOk is Err<never, apiError>)
| (Ok<apiResponse<T>, never> & {
      deconstruct: () => apiResponse<T> & { content(): T };
    })
  | (Err<never, apiError> & {
      deconstruct: () => apiError & { content(): undefined };
    }) {
  if (input === undefined || input === null) {
    const baseResult = err<never, apiError>({
      status: apiErrorStatus.NotFound,
      type: apiErrorTypes.NotFound,
      message: "Not found",
      error: null,
      _internal: { reported: false, reportable: false },
    });
    // Attach deconstruct to the actual neverthrow Err instance
    const finalResult = baseResult as Err<never, apiError> & {
      deconstruct: () => apiError & { content(): undefined };
    };
    finalResult.deconstruct = () => {
      return {
        ...baseResult.error, // Spread properties of the apiError object
        content: () => undefined,
      };
    };
    return finalResult;
  }

  // Handles inputs that are not undefined/null AND DO NOT have _type.
  // This is for unexpected structures if specific overloads for them don't exist or aren't matched.
  if (!("_type" in input)) {
    const baseResult = err<never, apiError>({
      status: apiErrorStatus.BadRequest,
      type: apiErrorTypes.BadRequestUnknown,
      message: "Invalid input: _type property missing and not undefined/null",
      error: null,
      _internal: { reported: false, reportable: false },
    });
    const finalResult = baseResult as Err<never, apiError> & {
      deconstruct: () => apiError & { content(): undefined };
    };
    finalResult.deconstruct = () => {
      return {
        ...baseResult.error,
        content: () => undefined,
      };
    };
    return finalResult;
  }

  if (input._type === "err") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _type, ...errorData } = input; // errorData is of type apiError
    const baseResult = err(errorData);
    // Attach deconstruct
    const finalResult = baseResult as Err<never, apiError> & {
      deconstruct: () => apiError & { content(): undefined };
    };
    finalResult.deconstruct = () => {
      return {
        ...baseResult.error, // errorData is baseResult.error
        content: () => undefined,
      };
    };
    return finalResult;
  }

  if (input._type === "ok") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _type, ...valueData } = input; // valueData is apiResponse<T>
    const baseResult = ok(valueData as apiResponse<T>);
    // Attach deconstruct
    const finalResult = baseResult as Ok<apiResponse<T>, never> & {
      deconstruct: () => apiResponse<T> & { content(): T };
    };
    finalResult.deconstruct = () => {
      return {
        ...baseResult.value, // valueData is baseResult.value
        content: () => baseResult.value.data as T,
      };
    };
    return finalResult;
  }

  // Fallback for type safety - should ideally not be reached if all inputs are covered.
  const fallbackBaseResult = err<never, apiError>({
    status: apiErrorStatus.Failed,
    type: apiErrorTypes.FailedUnknown,
    message: "Unknown error or unhandled input type in result function",
    error: null,
    _internal: { reported: false, reportable: true },
  });
  const finalFallbackResult = fallbackBaseResult as Err<never, apiError> & {
    deconstruct: () => apiError & { content(): undefined };
  };
  finalFallbackResult.deconstruct = () => {
    return {
      ...fallbackBaseResult.error,
      content: () => undefined,
    };
  };
  return finalFallbackResult;
}

export { result };

// --- Result Handling ---

/** Deconstructs a Result type into its value or error
 */
export function deconstruct<T>(
  input: syncOk<T> | syncErr<T> | syncObjectOk<T> | syncObjectErr,
):
  | (apiResponse<T> & { content(): T })
  | (apiError & { content(): apiError["error"] }) {
  if (isObjectResult(input)) {
    if (input._type === "err") {
      return {
        ...input,
        content: () => input.error,
      };
    }
    return {
      ...input,
      content: () => input.data as T,
    };
  }
  if (input.isErr()) {
    return {
      ...input.error,
      content: () => input.error.error,
    };
  }
  return {
    ...input.value,
    content: () => input.value.data as T,
  };
}

/** Passes back a Result type unchanged */

function passBack<T>(input: syncOk<T> | syncErr<T>): syncType<T>;
function passBack<T>(input: syncObjectOk<T> | syncObjectErr): syncObjectType<T>;
function passBack<T>(
  input: (syncOk<T> | syncErr<T>) | (syncObjectOk<T> | syncObjectErr),
): syncType<T> | syncObjectType<T> {
  if (isObjectResult(input)) {
    if (input._type === "err") {
      return input;
    }
    return ok(input);
  }
  if (input.isErr()) {
    return err(input.error);
  }
  return ok(input.value);
}

export { passBack };

function isObjectResult<T>(
  input: (syncOk<T> | syncErr<T>) | (syncObjectOk<T> | syncObjectErr),
): input is syncObjectOk<T> | syncObjectErr {
  return (
    (input as syncObjectOk<T>)._type === "ok" ||
    (input as syncObjectErr)._type === "err"
  );
}

// --- Reporting ---

/** Reports an error to error tracking services if reportable */
export function reportError(error: apiError): apiError {
  // Ensure _internal exists and has reportable/reported properties
  if (
    typeof error._internal?.reportable === "undefined" ||
    typeof error._internal.reported === "undefined"
  ) {
    console.error("Invalid error object structure for reporting:", error);
    return error; // Return original error if structure is invalid
  }

  if (!error._internal.reportable || error._internal.reported) return error;

  console.error(error);
  posthog.captureException(error);

  return {
    ...error,
    _internal: {
      ...error._internal,
      reported: true,
    },
  };
}

/** Logs/reports a successful response based on its status and internal state */
export function reportResponse<T>(response: apiResponse<T>): apiResponse<T> {
  // Ensure _internal exists and has loggable/logged properties
  if (
    typeof response._internal?.loggable === "undefined" ||
    typeof response._internal.logged === "undefined"
  ) {
    console.log("Invalid response object structure for logging:", response);
    return response; // Return original response if structure is invalid
  }

  if (!response._internal.loggable || response._internal.logged)
    return response;

  switch (response.status) {
    case apiResponseStatus.Success:
      console.info("API Success:", response);
      // Optionally capture info/analytics for success
      break;
    case apiResponseStatus.Inconsequential:
      console.log("API Inconsequential:", response);
      // Optionally capture info/analytics for inconsequential
      break;
    default:
      console.log("API Response:", response);
  }

  posthog.capture(`api-log:${response.status}`, {
    ...response,
    _internal: {
      ...response._internal,
      logged: true,
    },
  });

  return {
    ...response,
    _internal: {
      ...response._internal,
      logged: true,
    },
  };
}

/** Alias for reportError // neverthrow.err({}).mapErr(orReport) */
export const orReport = reportError;

/** Alias for reportResponse // neverthrow.ok({}).map(Log) */
export const Log = reportResponse;

// --- --- Builder Pattern Implementation --- ---

// --- Type Mappings ---

/** Generates mappings between status enums and their corresponding type enums */
function generateTypeMappings<
  StatusEnum extends Record<string, string>,
  TypesEnum extends Record<string, string>,
>(
  statusEnum: StatusEnum,
  typesEnum: TypesEnum,
): Partial<Record<StatusEnum[keyof StatusEnum], TypesEnum[keyof TypesEnum][]>> {
  const mappings: Record<string, string[]> = {};

  const statusValues = Object.values(statusEnum);
  const typeValues = Object.values(typesEnum);

  for (const status of statusValues) {
    mappings[status] = [];
    for (const type of typeValues) {
      // Check if the type name starts with the status name or is exactly the status name
      if (
        type.startsWith(status) &&
        (type === status || type.charAt(status.length) === ".")
      ) {
        mappings[status].push(type);
      }
    }
  }
  // partial because not all status have types
  return mappings as Partial<
    Record<StatusEnum[keyof StatusEnum], TypesEnum[keyof TypesEnum][]>
  >;
}

const responseMappings = generateTypeMappings(
  apiResponseStatus,
  apiResponseTypes,
);

const errorMappings = generateTypeMappings(apiErrorStatus, apiErrorTypes);

// --- Success Builder Types ---

// Helper type to filter available type methods based on Status
type FilteredOkTypeMethods<T, Status extends apiResponseStatus> = {
  [K in apiResponseTypes as K extends `${Status}.${infer Rest}`
    ? Rest
    : K extends Status
      ? K
      : never]: () => OkFinalizeChain<T, Status, K>;
};

/** Helper type for the initial chain of a successful response builder */
type OkInitialChain<T> = {
  [K in keyof typeof apiResponseStatus]: () => OkStatusChain<
    T,
    (typeof apiResponseStatus)[K]
  >;
};

/** Helper type for the status chain of a successful response builder */
type OkStatusChain<T, Status extends apiResponseStatus> = {
  message(msg: string): OkStatusChain<T, Status>;
  data<U>(data: U): OkStatusChain<U, Status>;
  build(): OkBuildChain<T>;
} & FilteredOkTypeMethods<T, Status>;

/** Helper type for the final chain of a successful response builder */
interface OkFinalizeChain<
  T,
  Status extends apiResponseStatus,
  Type extends apiResponseTypes,
> {
  message(msg: string): OkFinalizeChain<T, Status, Type>;
  data<U>(data: U): OkFinalizeChain<U, Status, Type>;
  build(): OkBuildChain<T>;
}

interface OkBuildChain<T> extends syncOk<T> {
  object(): syncObjectOk<T>;
}

// -- Input Types --

/** Type for the function input of a successful response builder */
type OkFunctionInput<T> = (
  s: typeof apiResponseStatus,
  t: typeof apiResponseTypes,
) => {
  status: apiResponseStatus;
  type?: apiResponseTypes;
  message?: string;
  data?: T;
};

/** Type for the object input of a successful response builder */
type OkObjectInput<T> = Partial<apiResponse<T>>;

// -- Builder Implementation --

/** Builder class for constructing successful API responses */
class OkBuilder<T> {
  protected status?: apiResponseStatus;
  protected type?: apiResponseTypes;
  protected _message?: string;
  protected _data?: T;
  protected _internal: apiResponse<T>["_internal"] = {
    loggable: false, // Default to not loggable // overwritten in build
    logged: false,
  };
  protected inputType: "chain" | "function" | "object";

  public setStatus(status: apiResponseStatus) {
    this.status = status;
  }

  constructor(input?: OkFunctionInput<T> | OkObjectInput<T>) {
    if (typeof input === "function") {
      this.inputType = "function";
      const result = input(apiResponseStatus, apiResponseTypes);
      this.status = result.status;
      this.type = result.type;
      this._message = result.message;
      this._data = result.data;
    } else if (
      input !== undefined &&
      typeof input === "object" &&
      input !== null
    ) {
      this.inputType = "object";
      this.status = input.status;
      this.type = input.type;
      this._message = input.message;
      this._data = input.data;
      this._internal = input._internal ?? { loggable: false, logged: false };
    } else {
      this.inputType = "chain";
    }
  }

  // Method to set internal logging state (chainable)
  _internalLoggable(loggable = true): OkStatusChain<T, apiResponseStatus> {
    if (this.inputType !== "chain") {
      console.error("Cannot call _internalLoggable on non-chain input");
      return this as unknown as OkStatusChain<T, apiResponseStatus>;
    }
    this._internal.loggable = loggable;
    return this as unknown as OkStatusChain<T, apiResponseStatus>;
  }

  // Method to add chainable type methods based on the selected status
  public addChainableMethods(): void {
    this.message = this.message.bind(this);
    this.data = this.data.bind(this);
    this.build = this.build.bind(this);
    this._internalLoggable = this._internalLoggable.bind(this);

    // Remove existing type methods to avoid conflicts
    for (const type of Object.values(apiResponseTypes)) {
      const methodName = type.split(".").pop()!;
      const simpleMethodName =
        String(type) === String(this.status) ? type : methodName;
      delete (this as Record<string, unknown>)[simpleMethodName];
    }

    const types = this.status ? (responseMappings[this.status] ?? []) : [];

    // Add new type methods based on the selected status
    for (const type of types) {
      const methodName = type.split(".").pop()!;
      const simpleMethodName =
        String(type) === String(this.status) ? type : methodName;

      (this as Record<string, unknown>)[simpleMethodName] = () => {
        this.type = type;
        if (String(this.type) === String(this.status)) {
          this.type = type;
        }
        return this;
      };

      if (String(type) === String(this.status)) {
        this.type = type;
      }
    }
  }

  message<Status extends apiResponseStatus>(
    msg: string,
  ): OkStatusChain<T, Status> {
    if (this.inputType !== "chain") {
      // This will result in a TypeScript error
      console.error("Cannot call message() on non-chain input");
      return this as unknown as OkStatusChain<T, Status>;
    }
    this._message = msg;
    return this as unknown as OkStatusChain<T, Status>;
  }

  data<Status extends apiResponseStatus>(data: T): OkStatusChain<T, Status> {
    if (this.inputType !== "chain") {
      // This will result in a TypeScript error
      console.error("Cannot call data() on non-chain input");
      return this as unknown as OkStatusChain<T, Status>;
    }
    this._data = data;
    return this as unknown as OkStatusChain<T, Status>;
  }

  build(): OkBuildChain<T> {
    const response: apiResponse<T> = {
      status: this.status ?? apiResponseStatus.Inconsequential, // Default status if not set
      type: this.type,
      message: this._message,
      data: this._data as T extends void | undefined | null ? undefined : T, // Cast to correct data type
      _internal: { ...this._internal, logged: false }, // Reset logged state before reporting
    };

    // Report the response before returning
    const reportedResponse = reportResponse(response);

    return {
      ...ok(reportedResponse),
      object: () => {
        return object(ok(reportedResponse));
      },
    } as OkBuildChain<T>;
  }
}

// --- Error Builder Types ---

// Helper type to filter available type methods based on Status
type FilteredErrTypeMethods<Status extends apiErrorStatus> = {
  [K in apiErrorTypes as K extends `${Status}.${infer Rest}`
    ? Rest
    : K extends Status
      ? K
      : never]: () => ErrFinalizeChain<Status, K>;
};

/** Helper type for the initial chain of an error response builder */
type ErrInitialChain = {
  [K in keyof typeof apiErrorStatus]: () => ErrStatusChain<
    (typeof apiErrorStatus)[K]
  >;
};

/** Helper type for the status chain of an error response builder */
type ErrStatusChain<Status extends apiErrorStatus> = {
  message(msg: string): ErrStatusChain<Status>;
  error(err: unknown): ErrStatusChain<Status>;
  build(): ErrBuildChain;
} & FilteredErrTypeMethods<Status>;

/** Helper type for the final chain of an error response builder */
interface ErrFinalizeChain<
  Status extends apiErrorStatus,
  Type extends apiErrorTypes,
> {
  message(msg: string): ErrFinalizeChain<Status, Type>;
  error(err: unknown): ErrFinalizeChain<Status, Type>;
  build(): ErrBuildChain;
}

interface ErrBuildChain extends syncNeverOk {
  object(): syncObjectNeverOk;
}

// -- Input Types --

/** Type for the function input of an error response builder */
type ErrFunctionInput = (
  s: typeof apiErrorStatus,
  t: typeof apiErrorTypes,
) => {
  status: apiErrorStatus;
  type: apiErrorTypes;
  message: string;
  error?: unknown;
};

/** Type for the object input of an error response builder */
type ErrObjectInput = Partial<apiError>;

// -- Builder Implementation ---

/** Builder class for constructing API error responses */
class ErrBuilder {
  protected status?: apiErrorStatus;
  protected type?: apiErrorTypes;
  protected _message?: string;
  protected _error?: unknown;
  protected _internal: apiError["_internal"] = {
    reported: false,
    reportable: true,
  };
  protected inputType: "chain" | "function" | "object";

  public setStatus(status: apiErrorStatus) {
    this.status = status;
  }

  constructor(input?: ErrFunctionInput | ErrObjectInput) {
    if (typeof input === "function") {
      this.inputType = "function";
      const result = input(apiErrorStatus, apiErrorTypes);
      this.status = result.status;
      this.type = result.type;
      this._message = result.message;
      this._error = result.error;
      this.updateInternal();
    } else if (input !== undefined) {
      this.inputType = "object";
      this.status = input.status;
      this.type = input.type;
      this._message = input.message;
      this._error = input.error;
      this._internal = input._internal ?? { reported: false, reportable: true };
      this.updateInternal();
    } else {
      this.inputType = "chain";
    }
  }

  // Method to add chainable type methods based on the selected status
  public addChainableMethods(): void {
    this.message = this.message.bind(this);
    this.error = this.error.bind(this);
    this.build = this.build.bind(this);

    for (const type of Object.values(apiErrorTypes)) {
      const methodName = type.split(".").pop()!;
      const simpleMethodName =
        String(type) === String(this.status) ? type : methodName;
      delete (this as Record<string, unknown>)[simpleMethodName];
    }

    const types = this.status ? (errorMappings[this.status] ?? []) : [];

    for (const type of types) {
      const methodName = type.split(".").pop()!;
      const simpleMethodName =
        String(type) === String(this.status) ? type : methodName;

      (this as Record<string, unknown>)[simpleMethodName] = () => {
        this.type = type;
        this.updateInternal();
        if (String(this.type) === String(this.status)) {
          this.type = type;
        }
        return this;
      };

      if (String(type) === String(this.status)) {
        this.type = type;
        this.updateInternal();
      }
    }
  }

  message<Status extends apiErrorStatus>(msg: string): ErrStatusChain<Status> {
    if (this.inputType !== "chain") {
      console.error("Cannot call message() on non-chain input");
      return this as unknown as ErrStatusChain<Status>;
    }
    this._message = msg;
    return this as unknown as ErrStatusChain<Status>;
  }

  error<Status extends apiErrorStatus>(err: unknown): ErrStatusChain<Status> {
    if (this.inputType !== "chain") {
      console.error("Cannot call error() on non-chain input");
      return this as unknown as ErrStatusChain<Status>;
    }
    this._error = err;
    return this as unknown as ErrStatusChain<Status>;
  }

  private updateInternal(): void {
    this._internal.reportable = true;

    if (
      this.status === apiErrorStatus.ValidationError &&
      this.type === apiErrorTypes.ValidationErrorZod
    ) {
      this._internal.reportable = false;
    } else if (
      this.status === apiErrorStatus.NotFound &&
      this.type === apiErrorTypes.NotFound
    ) {
      this._internal.reportable = false;
    }
  }

  build(): ErrBuildChain {
    const response: apiError = {
      status: this.status ?? apiErrorStatus.Failed,
      type: this.type ?? apiErrorTypes.FailedUnknown,
      message: this._message ?? "An error occurred",
      error: this._error ?? null,
      _internal: { ...this._internal, reported: false },
    };

    const reportedError = reportError(response);

    const errorResult = err(reportedError);

    return {
      ...errorResult,
      object: () => {
        return object(errorResult);
      },
    } as ErrBuildChain;
  }
}

// --- --- Builder Factory --- ---

/** Factory function for creating API response builders */
function constructInternal<T>() {
  return {
    ok: (
      input?: OkFunctionInput<T> | OkObjectInput<T>,
    ): OkBuildChain<T> | OkInitialChain<T> => {
      const builder = new OkBuilder<T>(input);
      if (
        typeof input === "function" ||
        (typeof input === "object" && input !== undefined)
      ) {
        return builder.build();
      }

      // Add initial chain methods (status methods) to the builder instance
      for (const status of Object.values(apiResponseStatus)) {
        (builder as unknown as Record<string, unknown>)[status] = () => {
          builder.setStatus(status);
          builder.addChainableMethods();
          return builder;
        };
      }
      // Add chainable methods initially, before a status is selected, so build() is available.
      // TypeScript will handle if required properties are missing when build() is called.
      builder.addChainableMethods();
      return builder as unknown as OkInitialChain<T>;
    },
    err: (
      input?: ErrFunctionInput | ErrObjectInput,
    ): ErrBuildChain | ErrInitialChain => {
      const builder = new ErrBuilder(input);
      if (
        typeof input === "function" ||
        (typeof input === "object" && input !== undefined)
      ) {
        return builder.build();
      }

      // Add initial chain methods (status methods) to the builder instance
      for (const status of Object.values(apiErrorStatus)) {
        (builder as unknown as Record<string, unknown>)[status] = () => {
          builder.setStatus(status);
          // Use public method to update internal state
          builder.addChainableMethods();
          return builder;
        };
      }
      // Add chainable methods initially, before a status is selected, so build() is available.
      // TypeScript will handle if required properties are missing when build() is called.
      builder.addChainableMethods();
      return builder as unknown as ErrInitialChain;
    },
  };
}
// --- Builder Aliases ---

/** Utility function to create neverthrow objects with api type */
function okAlias<T>(): OkInitialChain<T>;
function okAlias<T>(input: OkFunctionInput<T>): OkBuildChain<T>;
function okAlias<T>(input: OkObjectInput<T>): OkBuildChain<T>;
function okAlias<T>(
  input?: OkFunctionInput<T> | OkObjectInput<T>,
): OkBuildChain<T> | OkInitialChain<T> {
  if (
    typeof input === "function" ||
    (typeof input === "object" && input !== undefined)
  ) {
    const builder = new OkBuilder<T>(input);
    return builder.build();
  }
  return constructInternal<T>().ok() as OkInitialChain<T>;
}

/** Utility function to create neverthrow objects with api type */
function errAlias(): ErrInitialChain;
function errAlias(input: ErrFunctionInput): ErrBuildChain;
function errAlias(input: ErrObjectInput): ErrBuildChain;
function errAlias(
  input?: ErrFunctionInput | ErrObjectInput,
): ErrBuildChain | ErrInitialChain {
  if (
    typeof input === "function" ||
    (typeof input === "object" && input !== undefined)
  ) {
    const builder = new ErrBuilder(input);
    return builder.build();
  }
  return constructInternal().err() as ErrInitialChain;
}

export { okAlias as ok, errAlias as err };

/** Constructs the API response builders */
export function construct(): {
  ok: typeof okAlias;
  err: typeof errAlias;
} {
  return {
    ok: okAlias,
    err: errAlias,
  };
}
