const userInfo = require('./a')

function component() {
    const element = document.createElement('div');

    // lodash（目前通过一个 script 引入）对于执行这一行是必需的
    element.innerHTML = 'Hello,webpack'

    return element;
}

document.body.appendChild(component());
export default userInfo;