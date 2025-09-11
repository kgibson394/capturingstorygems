const Joi = require("joi");

module.exports = {
  paginationSchema: Joi.object({
    page: Joi.string().required().messages({
      "any.required": "Page is required",
      "string.empty": "Page is not allowed to be empty",
    }),

    pageSize: Joi.string().required().messages({
      "any.required": "Page size is required",
      "string.empty": "Page size is not allowed to be empty",
    }),
  }),

  getUsers: Joi.object({
    page: Joi.string().required().messages({
      "any.required": "Page is required",
      "string.empty": "Page is not allowed to be empty",
    }),

    pageSize: Joi.string().required().messages({
      "any.required": "Page size is required",
      "string.empty": "Page size is not allowed to be empty",
    }),

    search: Joi.string().allow("").optional().messages({
      "string.base": "Search must be a string",
    }),

    sortOrder: Joi.string().valid("old", "new").required().messages({
      "any.required": "Sort order is required",
      "any.only": "Sort order must be either 'old' or 'new'",
    }),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid("block", "un-block").required().messages({
      "any.required": "Status is required",
      "string.empty": "Status cannot be empty",
      "any.only": 'Status must be either "block" or "un-block"',
    }),
  }),

  createPlanSchema: Joi.object({
    name: Joi.string().required().messages({
      "string.base": "Name must be a string",
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty",
    }),
    type: Joi.string().valid("DIY", "DWY", "DFY").required().messages({
      "string.base": "Type must be a string",
      "any.required": "Type is required",
      "string.empty": "Type cannot be empty",
      "any.only": 'Type must be one of "DIY", "DWY", or "DFY"',
    }),
    price: Joi.number().min(1).required().messages({
      "any.required": "Price is required",
      "number.base": "Price must be a number",
      "number.min": "Price must be greater than 0",
    }),
    billingCycle: Joi.string().valid("monthly", "yearly").required().messages({
      "string.base": "Billing cycle must be a string",
      "any.required": "Billing cycle is required",
      "string.empty": "Billing cycle cannot be empty",
      "any.only": 'Billing cycle must be either "monthly" or "yearly"',
    }),
    allowedStories: Joi.number().min(1).required().messages({
      "any.required": "Allowed stories is required",
      "number.base": "Allowed stories must be a number",
      "number.min": "Allowed stories must be greater than 0",
    }),
    features: Joi.array().min(1).required().items(Joi.string()).messages({
      "array.base": "Features must be an array of strings",
      "array.min": "At least one feature is required",
      "any.required": "Features are required",
    }),

    featured: Joi.boolean().required().messages({
      "boolean.base": "Featured must be a 'true' or 'false'",
      "any.required": "Featured must be a 'true' or 'false'",
    }),
  }),

  updatePromptSchema: Joi.object({
    prompt: Joi.string().required().messages({
      "string.base": "Prompt must be a string",
      "any.required": "Prompt is required",
      "string.empty": "Prompt cannot be empty",
    }),
  }),

  publicStorySchema: Joi.object({
    author: Joi.string().required().messages({
      "any.required": "Author is required",
      "string.empty": "Author cannot be empty",
    }),
    title: Joi.string().required().messages({
      "any.required": "Title is required",
      "string.empty": "Title cannot be empty",
    }),
    story: Joi.string().required().messages({
      "any.required": "Story is required",
      "string.empty": "Story cannot be empty",
    }),
  }),

  groupSchema: Joi.object({
    groupTag: Joi.string().required().messages({
      "any.required": "Group tag is required",
      "string.empty": "Group tag cannot be empty",
    }),
    name: Joi.string().required().messages({
      "any.required": "Group name is required",
      "string.empty": "Group name cannot be empty",
    }),
  }),

  userIdSchema: Joi.object({
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "any.required": "User ID is required",
        "string.empty": "User ID cannot be empty",
        "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
      }),
  }),

  userIdsSchema: Joi.object({
    userIds: Joi.array()
      .items(
        Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .messages({
            "string.pattern.base":
              "Each User ID must be a valid MongoDB ObjectId",
          })
      )
      .min(1)
      .required()
      .messages({
        "any.required": "At least one User ID is required",
        "array.base": "User IDs must be an array",
        "array.min": "At least one User ID must be provided",
      }),
  }),
};
