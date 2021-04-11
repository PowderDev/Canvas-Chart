import { WIDTH, HEIGHT, DPI_WIDTH, DPI_HEIGHT, PADDING, VIEW_HEIGHT, VIEW_WIDTH, ROWS_COUNT, CIRCLE_RADIUS } from './constans'

export function computeBoudaries({ columns, types }) {
    let min, max

    // for (const [, y] of data) {
    //     if (typeof min !== 'number') min = y
    //     if (typeof max !== 'number') max = y

    //     if (min > y) min = y
    //     if (max < y) max = y
    // }

    columns.forEach(col => {
        if (types[col[0]] !== 'line') return

        if (!min) min = col[1]
        if (!max) max = col[1]

        for (let i = 1; i < col.length; i++) {
            if (min > col[i]) min = col[i]
            if (max < col[i]) max = col[i]
        }

    })

    return [min, max]
}

export function line(ctx, coords, color, translate) {
    ctx.beginPath()
    ctx.save()
    ctx.lineWidth = 4
    ctx.translate(translate, 0)
    ctx.strokeStyle = color
    for (const [x, y] of coords) {
        // ctx.lineTo(x, DPI_HEIGHT - PADDING - y * yRatio)
        ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.restore()
    ctx.closePath()
}

export function toCoords(xRatio, yRatio, DPI_HEIGHT, PADDING, yMin) {
    return (y, i) =>[
            Math.floor((i-1) * xRatio),
            Math.floor(DPI_HEIGHT - PADDING - (y - yMin) / yRatio)
        ]
}

export function isOver(mouse, x, length) {
    if (!mouse) return false
    const width = DPI_WIDTH / length
    return Math.abs(x - mouse.x) < width / 2
}

export function circle (ctx, [x, y], color) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.fillStyle = 'white'
    ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
}

export function translateX(length, xRatio, left) {
    return -1 * Math.round(left * length * xRatio / 1000)
}