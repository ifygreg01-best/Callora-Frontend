import React, { useState } from 'react';
import { Icons } from '../utils/icons';
import { formatPrice } from '../utils/format';
import '../styles/tokens.css';

export type CallStatus = 'success' | 'error';

export type CallRecord = {
  id: string;
  timestamp: Date;
  endpoint: string;
  status: CallStatus;
  responseTime: number;
  cost: number;
  request?: unknown;
  response?: unknown;
};

type Props = {
  call: CallRecord;
  formatTimestamp: (d: Date) => string;
  formatTime: (ms: number) => string;
};

/** Semantic icon token per status — no hardcoded colours. */
const STATUS_ICON_STYLE: Record<CallStatus, React.CSSProperties> = {
  success: { color: 'var(--icon-success)' },
  error:   { color: 'var(--icon-error)' },
};

const STATUS_LABEL: Record<CallStatus, string> = {
  success: 'success',
  error:   'error',
};

export function CallHistoryRow({ call, formatTimestamp, formatTime }: Props) {
  const [expanded, setExpanded] = useState(false);
  const iconStyle = STATUS_ICON_STYLE[call.status];

  return (
    <>
      <div className="table-row">
        <span>{formatTimestamp(call.timestamp)}</span>
        <span className="endpoint-cell">{call.endpoint}</span>

        {/* Status cell: icon + text, both themed via CSS custom property */}
        <span
          className={`status-cell ${call.status}`}
          style={iconStyle}
          aria-label={`Status: ${STATUS_LABEL[call.status]}`}
        >
          <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
            {call.status === 'success'
              ? <Icons.Success size={14} />
              : <Icons.Error   size={14} />}
          </span>
          {STATUS_LABEL[call.status]}
        </span>

        <span>{formatTime(call.responseTime)}</span>
        <span>{formatPrice(call.cost)} USDC</span>
        <span>
          <button
            className="ghost-button"
            onClick={() => setExpanded(prev => !prev)}
            aria-expanded={expanded}
            aria-controls={`call-details-${call.id}`}
          >
            {expanded ? 'Hide' : 'View'}
          </button>
        </span>
      </div>

      {expanded && (
        <div
          id={`call-details-${call.id}`}
          className="expanded-details"
          role="region"
          aria-label={`Details for call at ${formatTimestamp(call.timestamp)}`}
        >
          <div className="detail-section">
            <h4>Request</h4>
            <pre>{JSON.stringify(call.request ?? {}, null, 2)}</pre>
          </div>
          <div className="detail-section">
            <h4>Response</h4>
            <pre>{JSON.stringify(call.response ?? {}, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
}

export default CallHistoryRow;
