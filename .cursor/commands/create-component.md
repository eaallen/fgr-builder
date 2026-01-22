# How to Create a Component (Van.JS)

To get started, Van.js Component are just functions that return an item, for example:

```javascript
import {tags} from 'vanjs-core'
const {div} = tags
const HelloWorld = () => div("hello, world" )
```