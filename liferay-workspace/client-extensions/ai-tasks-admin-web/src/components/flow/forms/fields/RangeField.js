/**
 * @author Petteri Karttunen
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

const RangeField = ({
  className,
  helpText,
  label,
  max,
  min,
  onChange,
  parameterName,
  parameterValue,
  rangeWidth,
  step,
}) => {
  const { t } = useTranslation();

  return (
    <div className={'form-group ' + (className ? className : '')}>
      <label htmlFor={parameterName}>{label ? label : t(parameterName + '-label')}</label>
      <div className="clay-range" data-toggle="clay-css-range">
        <div className="clay-range-title">
          <span className="clay-range-value">{parameterValue}</span>
        </div>
        <div
          className="clay-range-input"
          data-label-min={min ? min : '0'}
          data-label-max={max ? max : '1'}
        >
          <input
            id={parameterName}
            className={'form-control-range'}
            type={'range'}
            min={min ? min : '0'}
            max={max ? max : '1'}
            step={step ? step : '0.1'}
            value={parameterValue}
            onChange={(e) => {
              onChange(parameterName, e.currentTarget.value);
            }}
          />
          <div className="clay-range-track"></div>
          <div className="clay-range-progress" style={{ width: parameterValue * 100 + '%' }}>
            <div className="clay-range-thumb"></div>
          </div>
        </div>
      </div>
      <small className="form-text text-muted">
        {helpText ? helpText : t(parameterName + '-help')}
      </small>
    </div>
  );
};

export default RangeField;
