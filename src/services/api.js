// // src/services/api.js
// //
// // Single place responsible for all HTTP communication with the Django
// // REST API. Components should never call fetch() or build backend URLs
// // directly — they call the functions exported from this module instead.

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
// console.log('API BASE URL:', API_BASE_URL);

// // Endpoint (relative to the base URL) that accepts new name records.
// // Kept as a constant here so it only needs to change in one place.
// const NAMES_ENDPOINT = '/api/names/'

// /**
//  * A small typed error so components can distinguish "the request went
//  * through but the server rejected it" from "the request never made it".
//  */
// export class ApiError extends Error {
//   constructor(message, { status = null, fieldErrors = null } = {}) {
//     super(message)
//     this.name = 'ApiError'
//     this.status = status
//     this.fieldErrors = fieldErrors
//   }
// }

// function buildUrl(path) {
//   if (!API_BASE_URL) {
//     // Fail loudly in development if the env var was never set, rather
//     // than silently sending requests to a relative (and wrong) URL.
//     throw new ApiError(
//       'The application is not configured with an API address. Set VITE_API_BASE_URL and restart the dev server.'
//     )
//   }
//   // Avoid accidental double slashes if the env var has a trailing slash.
//   return `${API_BASE_URL.replace(/\/$/, '')}${path}`
// }

// /**
//  * Turn whatever the backend sent back (JSON, empty body, HTML error page,
//  * etc.) into a plain object, without ever throwing on unexpected content.
//  */
// async function safeParseJson(response) {
//   const text = await response.text()
//   if (!text) return null
//   try {
//     return JSON.parse(text)
//   } catch {
//     return null
//   }
// }

// /**
//  * Pull a human-readable message out of a Django REST Framework style
//  * error payload, e.g. { "full_name": ["This field may not be blank."] }
//  * or { "detail": "Not found." }.
//  */
// function extractErrorMessage(data, fallback) {
//   if (!data || typeof data !== 'object') return fallback

//   if (typeof data.detail === 'string') return data.detail
//   if (typeof data.message === 'string') return data.message

//   if (data.full_name) {
//     const value = Array.isArray(data.full_name)
//       ? data.full_name[0]
//       : data.full_name
//     if (typeof value === 'string') return value
//   }

//   // Fall back to the first string-ish field error we can find.
//   for (const value of Object.values(data)) {
//     if (typeof value === 'string') return value
//     if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
//   }

//   return fallback
// }

// /**
//  * Submit a full name to the Django backend.
//  *
//  * @param {string} fullName - Already trimmed, non-empty name.
//  * @returns {Promise<{ message: string }>} A user-friendly success message.
//  * @throws {ApiError} With a user-friendly message on any failure.
//  */
// export async function submitFullName(fullName) {
//   const url = buildUrl(NAMES_ENDPOINT);

//   console.log('API URL:', url);
//   let response

//   try {
//     response = await fetch(buildUrl(NAMES_ENDPOINT), {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ full_name: fullName }),
//     })
//   } catch {
//     // fetch() itself only throws on network-level failures (offline,
//     // DNS failure, CORS block, backend not running, etc.)
//     throw new ApiError(
//       'Could not reach the server. Check your connection and try again.'
//     )
//   }

//   const data = await safeParseJson(response)

//   if (response.ok) {
//     const message =
//       (data && (data.message || data.detail)) || 'Name saved successfully.'
//     return { message }
//   }

//   if (response.status === 400) {
//     throw new ApiError(
//       extractErrorMessage(data, 'The name could not be validated. Please check it and try again.'),
//       { status: 400, fieldErrors: data }
//     )
//   }

//   if (response.status === 404) {
//     throw new ApiError(
//       'The API endpoint could not be found. Please contact support.',
//       { status: 404 }
//     )
//   }

//   if (response.status >= 500) {
//     throw new ApiError(
//       'The server ran into a problem saving this name. Please try again shortly.',
//       { status: response.status }
//     )
//   }

//   throw new ApiError(
//     extractErrorMessage(data, 'Something went wrong. Please try again.'),
//     { status: response.status }
//   )
// }

// src/services/api.js

// Base URL of the Django REST API.
// .env:
// VITE_API_BASE_URL=http://127.0.0.1:8000

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Django endpoint
const NAMES_ENDPOINT = '/api/names/';

/**
 * Custom API error.
 */
export class ApiError extends Error {
  constructor(message, status = null, fieldErrors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Build the complete API URL.
 */
function buildUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new ApiError(
      'The application is not configured with an API address. Set VITE_API_BASE_URL and restart the dev server.'
    );
  }

  return `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;
}

/**
 * Submit a full name to the Django REST API.
 *
 * @param {string} fullName
 * @returns {Promise<Object>}
 */
export async function submitFullName(fullName) {
  const url = buildUrl(NAMES_ENDPOINT);

  console.log('API BASE URL:', API_BASE_URL);
  console.log('API URL:', url);

  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: fullName,
      }),
    });
  } catch (error) {
    console.error('Network error:', error);
    console.error('Request URL:', url);

    throw new ApiError(
      'Could not reach the Django server. Check the backend server and API URL.'
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log('HTTP Status:', response.status);
  console.log('Backend Response:', data);

  if (response.ok) {
    return data;
  }

  if (response.status === 400) {
    const message =
      data?.full_name?.[0] ||
      data?.detail ||
      data?.message ||
      'Invalid full name.';

    throw new ApiError(message, 400, data);
  }

  if (response.status === 404) {
    throw new ApiError(
      'Django API endpoint was not found.',
      404
    );
  }

  if (response.status >= 500) {
    throw new ApiError(
      'Django server error. Check the backend.',
      response.status
    );
  }

  throw new ApiError(
    data?.detail ||
      data?.message ||
      'Something went wrong. Please try again.',
    response.status,
    data
  );
}
