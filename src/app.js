import './styles.scss'
import { getChartData } from './data'
import { chart } from './CanvasComponents/chart'
import data from './data.json'

const canvas = document.getElementById('chart')
chart(canvas, data[4]).init()

