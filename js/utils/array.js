// ==================== ARRAY UTILITY FUNCTIONS ====================

// Group array elements by a key function
export function groupBy(array, keyFunction) {
    if (!Array.isArray(array)) {
        throw new Error('First argument must be an array');
    }
    
    if (typeof keyFunction !== 'function') {
        throw new Error('Second argument must be a function');
    }
    
    return array.reduce((groups, item, index) => {
        const key = keyFunction(item, index);
        const keyString = String(key);
        
        if (!groups[keyString]) {
            groups[keyString] = [];
        }
        
        groups[keyString].push(item);
        return groups;
    }, {});
}

// Group by property name (shorthand for simple property grouping)
export function groupByProperty(array, propertyName) {
    return groupBy(array, item => item[propertyName]);
}

// Group by multiple properties
export function groupByMultiple(array, propertyNames) {
    return groupBy(array, item => {
        return propertyNames.map(prop => item[prop]).join('|');
    });
}

// Group and transform the result
export function groupByAndTransform(array, keyFunction, transformFunction) {
    const grouped = groupBy(array, keyFunction);
    const result = {};
    
    for (const [key, items] of Object.entries(grouped)) {
        result[key] = transformFunction(items, key);
    }
    
    return result;
}

// Group by and count occurrences
export function groupByAndCount(array, keyFunction) {
    return groupByAndTransform(array, keyFunction, items => items.length);
}

// Group by and get unique values
export function groupByAndUnique(array, keyFunction, valueFunction) {
    return groupByAndTransform(array, keyFunction, items => {
        const values = items.map(valueFunction);
        return [...new Set(values)];
    });
}

// Group by and aggregate (sum, average, etc.)
export function groupByAndAggregate(array, keyFunction, valueFunction, aggregateFunction) {
    return groupByAndTransform(array, keyFunction, items => {
        const values = items.map(valueFunction);
        return aggregateFunction(values);
    });
}

// Convert grouped object back to array
export function groupedToArray(groupedObject, keyName = 'key', itemsName = 'items') {
    return Object.entries(groupedObject).map(([key, items]) => ({
        [keyName]: key,
        [itemsName]: items
    }));
}
