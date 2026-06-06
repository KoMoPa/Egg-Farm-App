/**
 * Reusable warning/alert banner component
 * @param {Object} props
 * @param {string} props.message - The message to display (can include HTML via dangerouslySetInnerHTML)
 * @param {string} props.type - Banner type: 'over' | 'under' | 'info' (default: 'info')
 * @param {string} props.icon - Optional emoji icon (default: '⚠️')
 */
export default function WarningBanner({ message, type = 'info', icon = '⚠️' }) {
  const isFlag = type === 'over' || type === 'under'

  return (
    <div className={`warning-banner warning-banner--${type}`}>
      <span className={`warning-banner-badge ${isFlag ? 'warning-banner-badge--flag' : 'warning-banner-badge--info'}`}>
        {isFlag ? 'Flag' : 'Info'}
      </span>
      <span className="warning-banner-icon">{icon}</span>
      <span className="warning-banner-message">{message}</span>
    </div>
  )
}
