import { css } from "../utils"

export function tooltip(el) {
    function clear() {
        el.innerHTML = ''
    }

    return {
        show( {left, top}, data ) {
            const { height, width } = el.getBoundingClientRect()
            clear()

            css(el, {
                top: (top - height) + 'px',
                left: (left + width / 2) + 'px',
                display: 'block'
            })

            el.insertAdjacentHTML('afterbegin', template(data))
        },
        hide() {
            css(el, { display: 'none' })
        }
    }
}

function template (data) {
    return`
        <div class="tooltip-title">${data.title}</div>
        <ul class="tooltip-list">
            ${data.items
            .map((item) => {
                return `<li class="tooltip-list-item">
                <div class="value" style="color: ${item.color}">${item.value}</div>
                <div class="name" style="color: ${item.color}">${item.name}</div>
            </li>`
            })
            .join('\n')}
        </ul>
    `
}