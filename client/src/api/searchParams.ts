# URLSearchParams Complete Guide

## What is URLSearchParams?

URLSearchParams is a Web API that provides utilities for working with URL query strings. It's built into modern browsers and Node.js, making it the standard way to parse, manipulate, and construct query parameters.

## Basic Concepts

### Creating URLSearchParams

```javascript
// From current page URL
const params = new URLSearchParams(window.location.search);

// From a query string
const params = new URLSearchParams('?name=john&age=30');
const params = new URLSearchParams('name=john&age=30'); // ? is optional

// From an object (modern browsers)
const params = new URLSearchParams({
  name: 'john',
  age: '30'
});

// Empty instance
const params = new URLSearchParams();
```

### Core Methods

#### **Reading Parameters**

```javascript
const params = new URLSearchParams('name=john&age=30&city=NYC');

// Get single value
params.get('name'); // 'john'
params.get('missing'); // null

// Get all values for a key (for multiple values)
params.getAll('hobby'); // ['reading', 'coding'] if hobby=reading&hobby=coding

// Check if parameter exists
params.has('name'); // true
params.has('missing'); // false
```

#### **Writing Parameters**

```javascript
const params = new URLSearchParams();

// Set parameter (overwrites existing)
params.set('name', 'john');
params.set('age', '30');

// Append parameter (adds to existing)
params.append('hobby', 'reading');
params.append('hobby', 'coding'); // Now hobby has multiple values

// Delete parameter
params.delete('age');
```

#### **Iterating Parameters**

```javascript
const params = new URLSearchParams('name=john&age=30&city=NYC');

// Iterate over keys
for (const key of params.keys()) {
  console.log(key); // 'name', 'age', 'city'
}

// Iterate over values
for (const value of params.values()) {
  console.log(value); // 'john', '30', 'NYC'
}

// Iterate over entries
for (const [key, value] of params.entries()) {
  console.log(key, value); // 'name' 'john', 'age' '30', etc.
}

// Using forEach
params.forEach((value, key) => {
  console.log(key, value);
});
```

## Advanced Techniques

### Working with Arrays and Objects

```javascript
// Handling arrays
const filters = ['electronics', 'books', 'clothing'];
const params = new URLSearchParams();

filters.forEach(filter => params.append('category', filter));
// Result: category=electronics&category=books&category=clothing

// Reading arrays back
const categories = params.getAll('category');

// Handling objects
const searchConfig = {
  query: 'laptop',
  minPrice: 100,
  maxPrice: 1000,
  inStock: true
};

const params = new URLSearchParams();
Object.entries(searchConfig).forEach(([key, value]) => {
  params.set(key, String(value));
});
```

### URL Encoding and Decoding

```javascript
const params = new URLSearchParams();

// URLSearchParams automatically handles encoding
params.set('search', 'hello world & more');
params.set('special', 'café résumé');

console.log(params.toString()); 
// search=hello+world+%26+more&special=caf%C3%A9+r%C3%A9sum%C3%A9

// Values are automatically decoded when retrieved
console.log(params.get('search')); // 'hello world & more'
console.log(params.get('special')); // 'café résumé'
```

### Sorting Parameters

```javascript
const params = new URLSearchParams('z=1&a=2&m=3');

// Sort parameters alphabetically
params.sort();
console.log(params.toString()); // a=2&m=3&z=1
```

## Real-World Use Cases

### 1. Search Filters

```javascript
class SearchFilter {
  constructor(initialParams = {}) {
    this.params = new URLSearchParams(initialParams);
  }

  addFilter(key, value) {
    this.params.append(key, value);
    return this;
  }

  removeFilter(key, value = null) {
    if (value) {
      // Remove specific value
      const values = this.params.getAll(key);
      this.params.delete(key);
      values.filter(v => v !== value).forEach(v => this.params.append(key, v));
    } else {
      // Remove all values for key
      this.params.delete(key);
    }
    return this;
  }

  getFilters() {
    const filters = {};
    for (const [key, value] of this.params.entries()) {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          filters[key].push(value);
        } else {
          filters[key] = [filters[key], value];
        }
      } else {
        filters[key] = value;
      }
    }
    return filters;
  }

  toString() {
    return this.params.toString();
  }
}

// Usage
const filter = new SearchFilter({ category: 'electronics' });
filter.addFilter('brand', 'apple')
      .addFilter('brand', 'samsung')
      .addFilter('price_min', '100');

console.log(filter.toString()); // category=electronics&brand=apple&brand=samsung&price_min=100
```

### 2. Form Data to URL

```javascript
function formToURL(formData) {
  const params = new URLSearchParams();
  
  for (const [key, value] of formData.entries()) {
    if (value) { // Only add non-empty values
      params.append(key, value);
    }
  }
  
  return params.toString();
}

// Usage with form
const form = document.getElementById('searchForm');
const formData = new FormData(form);
const queryString = formToURL(formData);
```

### 3. URL State Management

```javascript
class URLStateManager {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
  }

  updateState(key, value) {
    if (value === null || value === undefined || value === '') {
      this.params.delete(key);
    } else {
      this.params.set(key, value);
    }
    this.updateURL();
  }

  getState(key, defaultValue = null) {
    return this.params.get(key) || defaultValue;
  }

  updateURL() {
    const newURL = `${window.location.pathname}?${this.params.toString()}`;
    window.history.pushState({}, '', newURL);
  }

  clearState() {
    this.params = new URLSearchParams();
    this.updateURL();
  }
}

// Usage
const state = new URLStateManager();
state.updateState('page', '2');
state.updateState('sort', 'name');
```

### 4. API Query Builder

```javascript
class APIQueryBuilder {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.params = new URLSearchParams();
  }

  where(field, value) {
    this.params.set(field, value);
    return this;
  }

  whereIn(field, values) {
    values.forEach(value => this.params.append(field, value));
    return this;
  }

  sort(field, direction = 'asc') {
    this.params.set('sort', `${field}:${direction}`);
    return this;
  }

  limit(count) {
    this.params.set('limit', count);
    return this;
  }

  offset(count) {
    this.params.set('offset', count);
    return this;
  }

  build() {
    return `${this.baseURL}?${this.params.toString()}`;
  }
}

// Usage
const query = new APIQueryBuilder('https://api.example.com/products')
  .where('category', 'electronics')
  .whereIn('brand', ['apple', 'samsung'])
  .sort('price', 'desc')
  .limit(20)
  .build();
```

## Common Patterns and Best Practices

### 1. Handling Multiple Values

```javascript
// Good: Use getAll() for multiple values
const categories = params.getAll('category');

// Bad: Using get() will only return the first value
const category = params.get('category'); // Only gets first value
```

### 2. Type Conversion

```javascript
// URLSearchParams always returns strings
const params = new URLSearchParams('age=30&active=true');

// Convert to appropriate types
const age = parseInt(params.get('age'), 10);
const isActive = params.get('active') === 'true';

// Helper function for type conversion
function getTypedParam(params, key, type, defaultValue = null) {
  const value = params.get(key);
  if (value === null) return defaultValue;
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'date':
      return new Date(value);
    default:
      return value;
  }
}
```

### 3. Validation and Sanitization

```javascript
function sanitizeParams(params) {
  const sanitized = new URLSearchParams();
  
  for (const [key, value] of params.entries()) {
    // Remove empty values
    if (value.trim() === '') continue;
    
    // Validate key format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) continue;
    
    // Sanitize value
    const cleanValue = value.trim().substring(0, 100); // Limit length
    sanitized.append(key, cleanValue);
  }
  
  return sanitized;
}
```

### 4. Merging Parameters

```javascript
function mergeParams(...paramSets) {
  const merged = new URLSearchParams();
  
  paramSets.forEach(params => {
    for (const [key, value] of params.entries()) {
      merged.append(key, value);
    }
  });
  
  return merged;
}

// Usage
const defaultParams = new URLSearchParams('sort=name&limit=10');
const userParams = new URLSearchParams('category=electronics');
const merged = mergeParams(defaultParams, userParams);
```

## Browser Compatibility and Polyfills

URLSearchParams is well-supported in modern browsers:
- Chrome 49+
- Firefox 44+
- Safari 10.1+
- Edge 17+

For older browsers, you can use a polyfill:

```javascript
// Check if URLSearchParams is available
if (!window.URLSearchParams) {
  // Load polyfill
  // npm install url-search-params-polyfill
  require('url-search-params-polyfill');
}
```

## Performance Considerations

### 1. Efficient Iteration

```javascript
// Good: Use for...of for better performance
for (const [key, value] of params.entries()) {
  // Process each parameter
}

// Less efficient: Converting to array first
Array.from(params.entries()).forEach(([key, value]) => {
  // Process each parameter
});
```

### 2. Batch Operations

```javascript
// Good: Batch multiple operations
const params = new URLSearchParams();
const updates = { name: 'john', age: '30', city: 'NYC' };

Object.entries(updates).forEach(([key, value]) => {
  params.set(key, value);
});

// Less efficient: Multiple toString() calls
params.set('name', 'john');
const url1 = params.toString();
params.set('age', '30');
const url2 = params.toString();
```

## Testing URLSearchParams

```javascript
describe('URLSearchParams', () => {
  test('should parse query string correctly', () => {
    const params = new URLSearchParams('name=john&age=30');
    expect(params.get('name')).toBe('john');
    expect(params.get('age')).toBe('30');
  });

  test('should handle multiple values', () => {
    const params = new URLSearchParams('hobby=reading&hobby=coding');
    expect(params.getAll('hobby')).toEqual(['reading', 'coding']);
  });

  test('should handle URL encoding', () => {
    const params = new URLSearchParams();
    params.set('search', 'hello world');
    expect(params.toString()).toBe('search=hello+world');
  });
});
```

## Summary

URLSearchParams is essential for modern web development. Key takeaways:

1. **Always use URLSearchParams** instead of manual string parsing
2. **Remember type conversion** - all values are strings
3. **Use getAll()** for parameters with multiple values
4. **Leverage iteration methods** for processing parameters
5. **Handle encoding automatically** - URLSearchParams does this for you
6. **Validate and sanitize** user input when building URLs
7. **Consider performance** when doing batch operations

Master these concepts and patterns, and you'll be able to handle any URL parameter scenario efficiently and safely.