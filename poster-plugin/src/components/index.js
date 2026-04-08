/**
 * 高级组件模块导出
 */

const createCard = require('./card')
const createBadge = require('./badge')
const createCTA = require('./cta')
const createFeature = require('./feature')
const createFeatureGrid = require('./featureGrid')
const createDivider = require('./divider')
const createAvatar = require('./avatar')
const createProgress = require('./progress')
const createRating = require('./rating')
const createQuote = require('./quote')
const createStatCard = require('./statCard')
const createTagCloud = require('./tagCloud')
const createStepper = require('./stepper')
const createTimeline = require('./timeline')
const { createListItem, createList } = require('./listItem')
const createNotification = require('./notification')
const createImageFrame = require('./imageFrame')
const createColumns = require('./columns')
const createGrid = require('./grid')
const createStar = require('./star')
const createArrow = require('./arrow')
const createProgressCircle = require('./progressCircle')
const createChip = require('./chip')
const createChart = require('./chart')
const createWatermark = require('./watermark')
const createTable = require('./table')
const createButton = require('./button')
const createIcon = require('./icon')
const createQRCode = require('./qrcode')
const createFrame = require('./frame')
const createBubble = require('./bubble')
const createRibbon = require('./ribbon')
const createSeal = require('./seal')
const createHighlightText = require('./highlightText')
const createBarcode = require('./barcode')

module.exports = {
  // 原有组件
  createCard,
  createBadge,
  createCTA,
  createFeature,
  createFeatureGrid,
  createDivider,
  createAvatar,
  createProgress,
  createRating,
  createQuote,
  createStatCard,
  createTagCloud,
  createStepper,
  createTimeline,
  createListItem,
  createList,
  createNotification,
  createImageFrame,
  createColumns,
  createGrid,
  // 新增组件
  createStar,
  createArrow,
  createProgressCircle,
  createChip,
  createChart,
  createWatermark,
  createTable,
  // 新增设计组件
  createButton,
  createIcon,
  createQRCode,
  createFrame,
  createBubble,
  createRibbon,
  createSeal,
  createHighlightText,
  createBarcode,
}
