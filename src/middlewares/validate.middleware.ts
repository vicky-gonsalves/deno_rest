// deno-lint-ignore-file

import { RouterContext, helpers, Status } from "../deps.ts";
import { throwError } from "./errorHandler.middleware.ts";

/**
 * Checks if there is any unwanted parameters provided and
 * throws error
 * @param fields
 * @param payload
 * @returns void
 */
const checkInvalidParams = (fields: any, payload: any): void => {
  const allowedParams = Object.keys(fields);
  const requestParams = Object.keys(payload);
  for (const param of requestParams) {
    if (allowedParams.indexOf(param) < 0) {
      throwError({
        status: Status.BadRequest,
        name: "ValidationError",
        path: param,
        param,
        message: `${param} is not allowed`,
        type: "forbidden",
      });
    }
  }
};

/**
 * Validates parameters against schema provided
 * @param schema
 * @param payload
 * @returns Promise<void>
 */
const checkValidation = async (
  schema: {
    fields: any;
    validate: (
      arg0: any,
      arg1: { stripUnknown: boolean; abortEarly: boolean },
    ) => any;
  },
  payload: any,
): Promise<void> => {
  checkInvalidParams(schema.fields, payload);
  try {
    await schema.validate(payload, { stripUnknown: true, abortEarly: true });
  } catch (validationErrors) {
    throw ({ ...validationErrors, status: 400 });
  }
};

/**
 * Checks body, params and queries and validates all of
 * its params with provided schema
 * @param schema
 * @returns Promise<void>
 */
export const validate = (schema: any) =>
  async (ctx: RouterContext, next: () => Promise<void>): Promise<void> => {
    const { params: _params, queries: _query, body: _body } = schema;
    const allQueries = [
      {
        type: "body",
        _data: await ctx.request.body().value,
        _schema: _body,
      },
      {
        type: "param",
        _data: ctx.params,
        _schema: _params,
      },
      {
        type: "query",
        _data: helpers.getQuery(ctx),
        _schema: _query,
      },
    ];

    for (const _q of allQueries) {
      if (_q._schema && _q._schema.fields && _q._data) {
        await checkValidation(_q._schema, _q._data);
      } else if (
        _q._data && Object.keys(_q._data).length &&
        (!_q._schema || _q._schema && !_q._schema.has("fields"))
      ) {
        throwError({
          status: 400,
          name: "ValidationError",
          path: _q.type,
          param: _q.type,
          message: `${_q.type} is not allowed`,
          type: "forbidden",
        });
      }
    }
    await next();
  };
