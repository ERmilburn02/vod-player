const createElement = <K extends keyof HTMLElementTagNameMap>(tag: K, properties: {[name: string]: any}): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tag);
    if (properties.classList) {
        if (typeof properties.classList === "string") {
            for (const className of properties.classList.split(" "))
                element.classList.add(className);
        }
        else if (Array.isArray(properties.classList)) {
            for (const className of properties.classList)
                element.classList.add(className);
        }
    }
    if (properties.style) {
        for (const stylePropertyName in properties.style)
            element.style.setProperty(stylePropertyName, properties.style[stylePropertyName]);
    }
    if (properties.text) {
        element.innerText = properties.text;
    }
    return element;
};

export {
    createElement
};