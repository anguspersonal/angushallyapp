/**
 * @fileoverview Bookmark Routes - Express Router Configuration
 * 
 * Configures and exports Express router for bookmark endpoints.
 * Maps HTTP methods to controller functions and applies middleware.
 */

const express = require('express');
const router = express.Router();
const bookmarkController = require('../bookmark-api/bookmarkController');

// List all bookmarks for authenticated user
router.get('/', bookmarkController.list);

// Create a single bookmark
router.post('/', bookmarkController.createSingle);

// Create multiple bookmarks in batch
router.post('/batch', bookmarkController.createBatch);

module.exports = router; 