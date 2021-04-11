import { WIDTH, HEIGHT, DPI_WIDTH, DPI_HEIGHT, PADDING, VIEW_HEIGHT, VIEW_WIDTH, ROWS_COUNT, CIRCLE_RADIUS, SPEED } from '../CanvasUtils/constans'
import { toCoords, isOver, line, circle, computeBoudaries, translateX  } from '../CanvasUtils/functions'
import { css, toDate } from '../utils'
import { sliderChart } from './slider';
import { tooltip } from './tooltip';


export function chart(root, data) {
    const canvas = root.querySelector('[data-el="main"]')
    const tip = tooltip(root.querySelector('[data-el="tooltip"]'))
    const slider = sliderChart(root.querySelector('[data-el="slider"]'), data)
    const ctx = canvas.getContext("2d");
    let raf;
    let prevMax;

    css(canvas, {
        width: WIDTH + "px",
        height: HEIGHT + "px"
    })

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT

    const proxy = new Proxy({}, {
        set(...args) {
            const result = Reflect.set(...args)
            raf = requestAnimationFrame(paint)
            return result
        }
    })

    canvas.addEventListener('mousemove', mousemove)
    canvas.addEventListener('mouseleave', mouseleave)

    slider.subscribe(position => {
        proxy.position = position
    })

    function mousemove({ clientX, clientY }){
        const { left, top } = canvas.getBoundingClientRect()
        proxy.mouse = {
            x: (clientX - left) * 2,
            tooltip: {
                left: clientX - left,
                top: clientY - top
            }
        }
    }

    function mouseleave() {
        proxy.mouse = null,
        tip.hide()
    }

    function paint() {
        clearCanvas()

        const length = data.columns[0].length
        const leftIndex  = Math.round(length * proxy.position[0] / 100)
        const rightIndex = Math.round(length * proxy.position[1] / 100)

        const columns = data.columns.map(col => {
            const res = col.slice(leftIndex, rightIndex)
            if (typeof res[0] !== 'string') {
                res.unshift(col[0])
            }
            return res
        })

        const [yMin, yMax] = computeBoudaries({ columns, types: data.types })

        if (!prevMax) {
            prevMax = yMax
            proxy.max = yMax
        }

        const max = getMax(yMax)
        const translate = translateX(data.columns[0].length, xRatio, proxy.position[0])

        const yRatio = (max - yMin) / VIEW_HEIGHT 
        const xRatio = VIEW_WIDTH / (columns[0].length - 2)

        const yData = columns.filter(col => data.types[col[0]] === 'line')
        const xData = columns.filter(col => data.types[col[0]] !== 'line')[0]

        yAxis( max, yMin)
        xAxis( xData, yData, xRatio)

        yData.forEach(col => {
            const coords = col
            .map(toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin))
            .filter((_, i) => i !== 0) // 0 это строка с названием

            const color =  data.colors[col[0]]
            line(ctx, coords, color, translate)

            for (const [x, y] of coords) {
                if (isOver(proxy.mouse, x, coords.length)) {
                    circle(ctx, [x, y], color)
                    break
                }
            }
        })
    }
    
    function clearCanvas() {
        ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
    }

    function xAxis( xData, yData, xRatio ) {
        const labelsCount = 6
        const step = Math.round(xData.length / labelsCount)
        ctx.beginPath()
        for (let i = 1; i < xData.length; i++) {
            const x = i * xRatio

            if ((i-1) % step === 0) {
                const text = toDate(xData[i])
                ctx.fillText(text, x, DPI_HEIGHT - 6)
            }

            if (isOver(proxy.mouse, x , xData.length)) {
                ctx.save()
                ctx.moveTo(x, PADDING / 2)
                ctx.lineTo(x, DPI_HEIGHT - PADDING)
                ctx.restore()

                tip.show(proxy.mouse.tooltip, {
                    title: toDate(xData[i]),
                    items: yData.map((col) => ({
                        color: data.colors[col[0]],
                        name: data.names[col[0]],
                        value: col[i+1]
                    }))
                })
            }
        }
        ctx.stroke()
        ctx.closePath()
    }

    function yAxis( yMax, yMin ) {
        const step = VIEW_HEIGHT / ROWS_COUNT
        const textStep = (yMax - yMin) / ROWS_COUNT

        ctx.beginPath();
        ctx.strokeStyle = "#bbb"
        ctx.font = 'normal 20px Helvetica,sans-serif'
        ctx.fillStyle = '#96a2aa'
        ctx.lineWidth = 1
        for (let i = 1; i <= ROWS_COUNT; i++) {
            const y = step * i
            const text = Math.round(yMax - textStep * i)
            ctx.fillText(text, 5, y+PADDING-10)
            ctx.moveTo(0, y + PADDING)
            ctx.lineTo(DPI_WIDTH, y + PADDING)
        }
        ctx.stroke();
        ctx.closePath()
    }

    function getMax (yMax) {
        const step = (yMax - prevMax) / SPEED

        if (proxy.max < yMax) {
            proxy.max += step
        } else if (proxy.max > yMax) {
            proxy.max = yMax
            prevMax = yMax
        }

        return proxy.max
    }

    return {
        init() {
            paint()
        },
        destroy() {
            cancelAnimationFrame(raf)
            canvas.removeEventListener('mousemove', mousemove)
            canvas.removeEventListener('mouseleave', mouseleave)
        }
    }
}