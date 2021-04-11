import { DEFAULT_SLIDER_WINDOW_WIDTH, DPI_WIDTH, MIN_WINDOW_WIDTH, WIDTH } from "../CanvasUtils/constans";
import { computeBoudaries, line, toCoords } from "../CanvasUtils/functions";
import { css } from "../utils";

const HEIGHT = 40
const DPI_HEIGHT = HEIGHT * 2

function noop() {}


export function sliderChart(root, data) {
    const canvas = root.querySelector('canvas')
    const ctx = canvas.getContext("2d");

    const $left = root.querySelector('[data-el="left"]')
    const $window = root.querySelector('[data-el="window"]')
    const $right = root.querySelector('[data-el="right"]')

    let nextFn = noop

    function next() {
        nextFn(getPosition())
    }

    css(canvas, {
        width: WIDTH + "px",
        height: HEIGHT + "px"
    })

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT

    setPosition(0, DEFAULT_SLIDER_WINDOW_WIDTH)

    root.addEventListener("mousedown", mousedown)
    document.addEventListener('mouseup', () => {
        root.onmousemove = null
    })

    function mousedown(event) {
        const type = event.target.dataset.type
        if (!type) return

        const dimensions = {
            left: parseInt($window.style.left),
            right: parseInt($window.style.right),
            width: parseInt($window.style.width),
        }
        
        if (type === "window") {
            const startX = event.pageX

            root.onmousemove = e => {
                const delta = e.pageX - startX
                if (delta === 0) return

                const left = dimensions.left + delta
                const right = dimensions.right - delta

                setPosition(left, right)
                next()
            }
        } else if (type === "left" || type === "right") {
            const startX = event.pageX

            root.onmousemove = e => {
                const delta = e.pageX - startX
                if (delta === 0) return

                if (type === 'left') {
                    const left = dimensions.left + delta
                    const right = dimensions.right
                    setPosition(left, right)
                } else {
                    const left = dimensions.left
                    const right = dimensions.right - delta
                    setPosition(left, right)
                }
                next()
            }
        }
    }

    function setPosition(left, right) {
        const w = WIDTH - right - left

        if (w < MIN_WINDOW_WIDTH) {
            css($window, { width: MIN_WINDOW_WIDTH + 'px' })
            return
        }

        if (left < 0) {
            css($window, { left: '0px' })
            return
        }

        if (right < 0) {
            css($window, { right: '0px' })
            return
        }

        css($window, {
            width: WIDTH+ 'px',
            left: left + 'px',
            right: right + 'px',
        })

        css($right, { width: right + 'px' })
        css($left, { width: left + 'px' })
    }

    function getPosition() {
        const left = parseInt($left.style.width)
        const right = WIDTH - parseInt($right.style.width)

        return [
            (left * 100) / WIDTH,
            (right * 100) / WIDTH
        ]
    }

    const [yMin, yMax] = computeBoudaries(data)
    const yRatio = (yMax - yMin) / DPI_HEIGHT
    const xRatio = DPI_WIDTH / (data.columns[0].length - 2)

    const yData = data.columns.filter(col => data.types[col[0]] === 'line')

    yData.forEach(col => {
        const coords = col
        .map(toCoords(xRatio, yRatio, DPI_HEIGHT, -5, yMin))
        .filter((_, i) => i !== 0) // 0 это строка с названием

        const color = data.colors[col[0]]
        line(ctx, coords, color)
    })


    return {
        subscribe(fn) {
            nextFn = fn
            fn(getPosition())
        }
    }
}