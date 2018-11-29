const ElementManager = () => {
    const _elementStorage = new Map();
    const remove = (tagIds) => {
        const storage = _elementStorage;

        const removeChild = child => {
            
            if(storage.get(child) !== undefined){
                const parent = storage.get(child).parentNode;
                parent != null ? parent.removeChild(storage.get(child)) : null;
            }

        };

        if (typeof tagIds === "string") {
            const tagId = tagIds;
            removeChild(tagId);
        }

        if (typeof tagIds === "object") {
            tagIds.forEach(el => {removeChild(el)});
        }
    };

    const get = (tagId) => {
        function getElement(elementId){
            if(_elementStorage.has(elementId)){
                return _elementStorage.get(elementId);
            } else {
                throw `[${elementId}] is not in the storage!`;
            }
        }

        return tagId instanceof Array ? tagId.map(x => getElement(x)) : getElement(tagId)
    }

    return {
        get:tagId => {
            return get(tagId);
        },

        create: (...elementArr) => {
            const 
                storage = _elementStorage, 
                parser = new DOMParser(),
                returnObj = {};

            // Store element, if the tagId already exist it will throw an error!
            const storeElement = (tagId, generatedElement) => {
                storage.has(tagId) === false ?  storage.set(tagId, generatedElement) :  () => {throw `[${tagId}] is exist in storage!`}; 
            }

            // Generate htmlNode from string
            const generateNode = htmlString => parser.parseFromString( htmlString, 'text/html').body.firstChild.cloneNode(true);

            elementArr = elementArr.map( item => [ item[0], generateNode(item[1]), item[2] ]);
            
            // Loop trough on the elementArray and generate the elements
            for(let i = 0; i < elementArr.length; i++){
                const [tagId, element] = elementArr[i];
                storeElement(tagId, element); 
                returnObj[tagId] = element;
            }
            return returnObj;
        },

        remove: tagIds => {
            remove(tagIds);
        },

        append: (elementTree) => {
            return function loop(obj) {
                const 
                    childrens = obj.children.map(x => x instanceof Object ? loop(x) : _elementStorage.get(x)),
                    parent = _elementStorage.get(obj.parent);

                parent.append(...childrens);
                return parent;
            }(elementTree)
        },

        fetch: () => {
            return _elementStorage;
        },

        fetch2: () => {
            console.log(_elementStorage);
        }
    }
}
