'use strict';

const Joi = require('joi');

// Task Schema
const taskSchema = Joi.object({
    title: Joi.string()
        .max(100)
        .required()
        .messages({
            'string.base': 'Title should be a string',
            'string.empty': 'Title cannot be empty',
            'string.max': 'Title should have at most 100 characters',
            'any.required': 'Title is required'
        }),
    description: Joi.string()
        .max(500)
        .optional()
        .messages({
            'string.base': 'Description should be a string',
            'string.max': 'Description should have at most 500 characters'
        }),
    dueDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'Due date should be a valid date',
            'date.format': 'Due date should be in ISO format'
        }),
    status: Joi.string()
        .valid('pending', 'in-progress', 'completed')
        .required()
        .messages({
            'string.base': 'Status should be a string',
            'any.only': 'Status must be one of: pending, in-progress, completed',
            'any.required': 'Status is required'
        })
});

// Daily Entry Schema
const dailyEntrySchema = Joi.object({
    date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Date should be a valid date',
            'any.required': 'Date is required'
        }),
    content: Joi.string()
        .max(1000)
        .required()
        .messages({
            'string.base': 'Content should be a string',
            'string.empty': 'Content cannot be empty',
            'string.max': 'Content should have at most 1000 characters',
            'any.required': 'Content is required'
        }),
    mood: Joi.string()
        .valid('happy', 'sad', 'neutral', 'stressed', 'excited')
        .optional()
        .messages({
            'string.base': 'Mood should be a string',
            'any.only': 'Mood must be one of: happy, sad, neutral, stressed, excited'
        })
});

// Goal Schema
const goalSchema = Joi.object({
    title: Joi.string()
        .max(100)
        .required()
        .messages({
            'string.base': 'Title should be a string',
            'string.empty': 'Title cannot be empty',
            'string.max': 'Title should have at most 100 characters',
            'any.required': 'Title is required'
        }),
    targetDate: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Target date should be a valid date',
            'any.required': 'Target date is required'
        }),
    progress: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
            'number.base': 'Progress should be a number',
            'number.min': 'Progress cannot be less than 0',
            'number.max': 'Progress cannot be more than 100',
            'any.required': 'Progress is required'
        })
});

module.exports = {
    taskSchema,
    dailyEntrySchema,
    goalSchema
};